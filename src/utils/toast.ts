import { ToastAndroid, Platform, Alert } from 'react-native';

export const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // For iOS, since we don't have a toast library installed, 
    // we use a non-intrusive alert that automatically disappears (not natively supported)
    // or just a simple alert.
    Alert.alert('', message);
  }
};
