import NetInfo from '@react-native-community/netinfo';
import { getFirestore, collection, doc, writeBatch, getDocs, setDoc } from '@react-native-firebase/firestore';
import { db, getTasks, updateTaskInDB } from '../database/db';
import { store } from '../features/store';
import { setTasks } from '../features/tasks/tasksSlice';

const TASKS_COLLECTION = 'tasks';

export const startSyncEngine = () => {
  // Listen to network changes
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      console.log('Online: Triggering Sync...');
      syncData();
    }
  });

  return unsubscribe;
};

export const syncData = async () => {
  try {
    const state = store.getState();
    const user = state.auth.user;
    if (!user) return; // Only sync if logged in

    const firestoreDb = getFirestore();
    const userTasksRef = collection(firestoreDb, TASKS_COLLECTION, user.uid, 'userTasks');

    // 1. Push local unsynced changes to Firestore
    const localTasks = getTasks();
    const unsyncedTasks = localTasks.filter((t: any) => !t.synced_status);

    const batch = writeBatch(firestoreDb);
    for (const task of unsyncedTasks) {
      const docRef = doc(userTasksRef, task.id);
      batch.set(docRef, {
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        updated_at: task.updated_at,
      }, { merge: true });
    }
    await batch.commit();

    // Mark as synced locally
    for (const task of unsyncedTasks) {
      updateTaskInDB({ ...task, synced_status: true });
    }

    // 2. Pull remote changes
    const snapshot = await getDocs(userTasksRef);
    const remoteTasks = snapshot.docs.map((doc: any) => doc.data());

    remoteTasks.forEach((remoteTask: any) => {
      const localTask = localTasks.find((t: any) => t.id === remoteTask.id);
      // Simple conflict resolution: last write wins based on updated_at
      if (!localTask || remoteTask.updated_at > localTask.updated_at) {
        db.executeSync(
          `INSERT OR REPLACE INTO tasks (id, title, description, completed, synced_status, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            remoteTask.id,
            remoteTask.title,
            remoteTask.description,
            remoteTask.completed ? 1 : 0,
            1, // Synced because it came from server
            remoteTask.updated_at
          ]
        );
      }
    });

    // Update Redux UI state after full sync
    const finalTasks = getTasks();
    store.dispatch(setTasks(finalTasks));

  } catch (error) {
    console.error('Sync failed:', error);
  }
};
