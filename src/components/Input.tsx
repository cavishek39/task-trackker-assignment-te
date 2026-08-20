import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface CustomInputProps extends TextInputProps {
  isPassword?: boolean;
}

export const Input: React.FC<CustomInputProps> = ({ isPassword, ...props }) => {
  const { colors } = useTheme();
  const [isSecure, setIsSecure] = useState(isPassword);

  const toggleSecure = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        secureTextEntry={isSecure}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
            paddingRight: isPassword ? 50 : 16,
          },
          props.style,
        ]}
        placeholderTextColor={colors.textSecondary}
      />
      {isPassword && (
        <TouchableOpacity style={styles.eyeIconContainer} onPress={toggleSecure}>
          <Text style={{ fontSize: 18, opacity: isSecure ? 0.4 : 1 }}>👁️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
