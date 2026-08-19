import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const NetworkIndicator = () => {
  const { isConnected } = useNetInfo();
  const insets = useSafeAreaInsets();

  // If connected (or undefined during initial check), don't show anything
  if (isConnected !== false) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top }]}>
      <Text style={styles.text}>No Internet Connection - Working Offline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#E53935', // Red
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Ensure it sits on top of all screens
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
