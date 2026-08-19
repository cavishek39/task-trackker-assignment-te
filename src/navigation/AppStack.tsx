import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const LazyTaskListScreen = lazy(() => import('../screens/tasks/TaskListScreen').then(m => ({ default: m.TaskListScreen })));
const LazyTaskDetailsScreen = lazy(() => import('../screens/tasks/TaskDetailsScreen').then(m => ({ default: m.TaskDetailsScreen })));

const Stack = createNativeStackNavigator();

const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

const TaskListScreen = (props: any) => (
  <Suspense fallback={<LoadingFallback />}><LazyTaskListScreen {...props} /></Suspense>
);

const TaskDetailsScreen = (props: any) => (
  <Suspense fallback={<LoadingFallback />}><LazyTaskDetailsScreen {...props} /></Suspense>
);

export const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen 
        name="TaskDetails" 
        component={TaskDetailsScreen} 
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};
