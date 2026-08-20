import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../features/store';
import {
  addTask,
  updateTask,
  deleteTask,
} from '../../features/tasks/tasksSlice';
import {
  insertTask,
  updateTaskInDB,
  deleteTaskFromDB,
} from '../../database/db';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { showToast } from '../../utils/toast';

const NOTIFICATION_TIME = 1 * 60 * 1000; // 1 minute (for testing purposes)
const REMINDER_CHANNEL_ID = 'task-reminders';

export const TaskDetailsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const dispatch = useDispatch();

  const taskId = route.params?.taskId;
  const existingTask = useSelector((state: RootState) =>
    state.tasks.tasks.find(t => t.id === taskId),
  );

  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(
    existingTask?.description || '',
  );
  const [completed, setCompleted] = useState(existingTask?.completed || false);

  const scheduleReminder = async (taskName: string) => {
    // Schedule a reminder for 1 minute from now as a proof-of-concept
    const date = new Date(Date.now() + NOTIFICATION_TIME);
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.requestPermission();
    await notifee.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Task Reminders',
    });

    await notifee.createTriggerNotification(
      {
        title: 'Task Reminder',
        body: `Don't forget: ${taskName}`,
        android: {
          channelId: REMINDER_CHANNEL_ID,
        },
      },
      trigger,
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const taskData = {
      id: taskId || Date.now().toString(),
      title,
      description,
      completed,
      synced_status: false,
      updated_at: Date.now(),
    };

    if (taskId) {
      updateTaskInDB(taskData);
      dispatch(updateTask(taskData));
      showToast('Task updated successfully');
    } else {
      insertTask(taskData);
      dispatch(addTask(taskData));
      showToast('Task created successfully');
      // Schedule reminder on new task creation
      scheduleReminder(title).catch(console.error);
    }
    
    // Trigger immediate background sync
    import('../../api/syncEngine').then(module => module.syncData());
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const handleDelete = () => {
    if (taskId) {
      deleteTaskFromDB(taskId);
      dispatch(deleteTask(taskId));
      showToast('Task deleted');
      
      // Note: Full offline deletion sync (soft deletes) requires more complex logic,
      // but we can trigger a sync here for standard updates.
      import('../../api/syncEngine').then(module => module.syncData());
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {taskId ? 'Edit Task' : 'New Task'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text
            style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Input placeholder="Task Title" value={title} onChangeText={setTitle} />
        <Input
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.textArea}
        />

        {taskId && (
          <>
            <Button
              title={completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              onPress={() => {
                const newStatus = !completed;
                setCompleted(newStatus);
                showToast(newStatus ? 'Task completed! 🎉' : 'Task marked as incomplete');
                
                // Auto-save completion status immediately
                const taskData = {
                  id: taskId,
                  title,
                  description,
                  completed: newStatus,
                  synced_status: false,
                  updated_at: Date.now(),
                };
                updateTaskInDB(taskData);
                dispatch(updateTask(taskData));
                import('../../api/syncEngine').then(module => module.syncData());
              }}
              style={{
                marginTop: 24,
                backgroundColor: completed ? colors.surface : colors.primary,
                borderColor: colors.primary,
                borderWidth: 1,
              }}
              textStyle={{ color: completed ? colors.primary : '#FFF' }}
            />
            <Button
              title="Delete Task"
              onPress={handleDelete}
              style={[
                styles.deleteButton,
                {
                  backgroundColor: 'transparent',
                  borderColor: colors.danger,
                  borderWidth: 1,
                },
              ]}
              textStyle={{ color: colors.danger }}
            />
          </>
        )}
      </View>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  deleteButton: {
    marginTop: 24,
  },
});
