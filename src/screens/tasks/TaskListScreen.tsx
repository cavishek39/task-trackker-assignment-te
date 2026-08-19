import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
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
    const updatedTask = { ...task, completed: !task.completed, synced_status: false, updated_at: Date.now() };
    updateTaskInDB(updatedTask);
    dispatch(updateTask(updatedTask));
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
        }
      ]}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
    >
      <TouchableOpacity 
        style={[
          styles.checkbox, 
          { 
            borderColor: item.completed ? colors.primary : colors.textSecondary, 
            backgroundColor: item.completed ? colors.primary : 'transparent' 
          }
        ]}
        onPress={() => handleToggleComplete(item)}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskTitle, { color: colors.text, textDecorationLine: item.completed ? 'line-through' : 'none' }]}>
          {item.title}
        </Text>
        {!!item.description && (
          <Text numberOfLines={1} style={[styles.taskDescription, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Tasks</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => dispatch({ type: 'theme/toggleTheme' })}
            style={{ marginRight: 16 }}
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
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tasks yet. Add one!</Text>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={(data, index) => (
          { length: 80, offset: 80 * index, index } // Card height roughly 80
        )}
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
