import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { RootState } from '../../features/store';
import { setTasks, updateTask } from '../../features/tasks/tasksSlice';
import { getTasks, updateTaskInDB, deleteTaskFromDB } from '../../database/db';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/Button';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const TaskListScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  const loadTasks = useCallback(() => {
    const localTasks = getTasks();
    dispatch(setTasks(localTasks));
  }, [dispatch]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggleComplete = (task: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updatedTask = {
      ...task,
      completed: !task.completed,
      synced_status: false,
      updated_at: Date.now(),
    };
    updateTaskInDB(updatedTask);
    dispatch(updateTask(updatedTask));

    const { showToast } = require('../../utils/toast');
    showToast(
      updatedTask.completed
        ? 'Task completed! 🎉'
        : 'Task marked as incomplete',
    );

    // Trigger immediate background sync
    import('../../api/syncEngine').then(module => module.syncData());
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: item.completed ? 0.6 : 1, // Dim completed tasks
        },
      ]}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            borderColor: item.completed ? colors.primary : colors.textSecondary,
            backgroundColor: item.completed ? colors.primary : 'transparent',
          },
        ]}
        onPress={() => handleToggleComplete(item)}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.taskTextContainer}>
        <Text
          style={[
            styles.taskTitle,
            {
              color: colors.text,
              textDecorationLine: item.completed ? 'line-through' : 'none',
            },
          ]}
        >
          {item.title}
        </Text>
        {!!item.description && (
          <Text
            numberOfLines={1}
            style={[styles.taskDescription, { color: colors.textSecondary }]}
          >
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Tasks</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* <TouchableOpacity 
            onPress={() => {
              const demoTasks = [
                { id: Date.now().toString() + '1', title: 'Prepare Q3 Engineering OKRs', description: 'Draft the technical goals for Q3 including the transition to React Native new architecture (Fabric) and reducing CI/CD build times by 20%.', completed: false, synced_status: false, updated_at: Date.now() + 1000 },
                { id: Date.now().toString() + '2', title: 'Review Offline Sync Architecture PR', description: 'Review the pull request for the new SQLite-to-Firestore syncing engine. Ensure conflict resolution handles offline deletions correctly.', completed: false, synced_status: false, updated_at: Date.now() + 2000 },
                { id: Date.now().toString() + '3', title: '1:1 with Senior Frontend Engineer', description: 'Discuss career progression, recent performance on the navigation refactor, and potential mentorship opportunities.', completed: false, synced_status: false, updated_at: Date.now() + 3000 },
                { id: Date.now().toString() + '4', title: 'Optimize App Bundle Size', description: 'Analyze Metro bundler output and lazy load the Reanimated library to cut the initial JS bundle size by at least 15%.', completed: false, synced_status: false, updated_at: Date.now() + 3500 },
                { id: Date.now().toString() + '5', title: 'Interview Candidate (Backend Role)', description: 'Conduct the final systems design interview round for the Senior Backend Engineer position at 2:00 PM EST.', completed: false, synced_status: false, updated_at: Date.now() + 3800 },
                { id: Date.now().toString() + '6', title: 'Finalize GraphQL API Schema', description: 'Coordinate with backend team to finalize the mutations required for the upcoming user permissions overhaul.', completed: true, synced_status: false, updated_at: Date.now() + 4000 },
                { id: Date.now().toString() + '7', title: 'Fix Android Status Bar UI Bug', description: 'Implement react-native-safe-area-context to prevent the header from sinking underneath the transparent status bar on modern Android devices.', completed: true, synced_status: false, updated_at: Date.now() + 5000 },
                { id: Date.now().toString() + '8', title: 'Patch Security Vulnerabilities', description: 'Run yarn audit and patch the critical vulnerability reported in the lodash dependency chain.', completed: true, synced_status: false, updated_at: Date.now() + 6000 },
                { id: Date.now().toString() + '9', title: 'Deploy v2.4.0 to Staging', description: 'Trigger the GitHub Actions workflow to deploy the latest release candidate to the staging environment for QA testing.', completed: true, synced_status: false, updated_at: Date.now() + 7000 },
              ];
              const { insertTask, getTasks } = require('../../database/db');
              demoTasks.forEach(t => insertTask(t));
              dispatch(setTasks(getTasks()));
              require('../../utils/toast').showToast('Demo data injected!');
            }}
            style={{ marginRight: 24 }}
          >
            <Text style={{ fontSize: 14, color: colors.primary }}>Seed Demo</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => {
              dispatch({ type: 'theme/toggleTheme' });
              const { setSetting } = require('../../database/db');
              setSetting('isDarkMode', (!isDarkMode).toString());
            }}
            style={{ marginRight: 32 }}
          >
            <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={{ color: colors.danger, fontSize: 16 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tasks yet. Add one!
          </Text>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={
          (data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
          }) // Card height roughly 80
        }
      />

      <Button
        title="+ Add Task"
        onPress={() => navigation.navigate('TaskDetails')}
        style={styles.addButton}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
  },
  addButton: {
    margin: 16,
  },
});
