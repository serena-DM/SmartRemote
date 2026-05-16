import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const RemoteButton = ({ label, onPress, color = '#1a1a2e', size = 'medium', style }: Props) => {
  const btnSize = size === 'large' ? 70 : size === 'small' ? 45 : 55;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: color, width: btnSize, height: btnSize, borderRadius: btnSize / 2 }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  label: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default RemoteButton;
