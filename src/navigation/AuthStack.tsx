import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const LazyLoginScreen = lazy(() => import('../screens/auth/LoginScreen').then(m => ({ default: m.LoginScreen })));
const LazySignUpScreen = lazy(() => import('../screens/auth/SignUpScreen').then(m => ({ default: m.SignUpScreen })));

const Stack = createNativeStackNavigator();

const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

const LoginScreen = (props: any) => (
  <Suspense fallback={<LoadingFallback />}><LazyLoginScreen {...props} /></Suspense>
);

const SignUpScreen = (props: any) => (
  <Suspense fallback={<LoadingFallback />}><LazySignUpScreen {...props} /></Suspense>
);

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};
