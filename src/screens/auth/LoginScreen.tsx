import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // RootNavigator will automatically detect auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Login to manage your tasks.
        </Text>

        <Input
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <Button 
          title="Login" 
          onPress={handleLogin} 
          loading={loading} 
          style={styles.button}
        />

        <Button 
          title="Don't have an account? Sign Up" 
          onPress={() => navigation.navigate('SignUp')} 
          style={[styles.button, { backgroundColor: 'transparent' }]}
          // @ts-ignore
          textStyle={{ color: colors.primary }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  button: {
    marginTop: 16,
  },
});
