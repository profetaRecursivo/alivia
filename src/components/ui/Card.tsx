import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Borde de énfasis semántico (p. ej. tarjeta crítica). */
  accent?: string;
  onPress?: () => void;
};

/** Tarjeta base: superficie blanca, borde sutil y sombra de tarjeta. */
export function Card({ children, style, accent, onPress }: Props) {
  const inner = (
    <View
      style={[
        styles.card,
        accent ? { borderColor: accent } : null,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadows.card,
  },
});
