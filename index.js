/**
 * @format
 */

import {AppRegistry} from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './src/App';
import {name as appName} from './app.json';

// Bonus: Handle background messages from FCM
const messaging = getMessaging();
setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
