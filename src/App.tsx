import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getMessaging, requestPermission, getToken, onMessage } from '@react-native-firebase/messaging';
import { store } from './features/store';
import { RootNavigator } from './navigation/RootNavigator';
import { NetworkIndicator } from './components/NetworkIndicator';
import { LogBox } from 'react-native';
import { initDB, getSetting } from './database/db';
import { startSyncEngine } from './api/syncEngine';
import { setTheme } from './features/theme/themeSlice';

LogBox.ignoreLogs(['Require cycle:', 'new NativeEventEmitter']);

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    initDB();

    // Dispatch saved theme setting to Redux
    const savedTheme = getSetting('isDarkMode');
    if (savedTheme !== null) {
      dispatch(setTheme(savedTheme === 'true'));
    }

    const unsubscribeSync = startSyncEngine();
    
    // Bonus: Request permission for FCM
    const requestUserPermission = async () => {
      const messaging = getMessaging();
      const authStatus = await requestPermission(messaging);
      
      // Values are 1 (AUTHORIZED) or 2 (PROVISIONAL)
      const enabled = authStatus === 1 || authStatus === 2;
      if (enabled) {
        console.log('FCM Authorization status:', authStatus);
        const token = await getToken(messaging);
        console.log('FCM Token:', token);
      }
    };
    requestUserPermission();

    const messagingInstance = getMessaging();
    const unsubscribeForeground = require('@react-native-firebase/messaging').onMessage(messagingInstance, async (remoteMessage: any) => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
      const { Alert } = require('react-native');
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification', 
        remoteMessage.notification?.body || 'You have a new message from Firebase!'
      );
    });

    return () => {
      unsubscribeSync();
      unsubscribeForeground();
    };
  }, []);

  return (
    <>
      <RootNavigator />
      <NetworkIndicator />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
