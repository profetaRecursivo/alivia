import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Borde rojo cuando el grupo de chips está en error. */
  error?: boolean;
  /** Rol semántico: botón suelto, radio de un grupo o checkbox. */
  role?: 'button' | 'radio' | 'checkbox';
  style?: ViewStyle;
};

/** Chip de filtro / motivo. Área táctil ≥ 44 px (Ley de Fitts). */
export function Chip({
  label,
  selected = false,
  onPress,
  error = false,
  role = 'button',
  style,
}: Props) {
  const state =
    role === 'radio' || role === 'checkbox'
      ? { checked: selected }
      : { selected };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={state}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        error && styles.chipError,
        style,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  chipError: { borderColor: Colors.critical.border },
  label: {
    fontSize: Typography.scale.button,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.primaryContainerText,
    fontFamily: Typography.fontFamilySemiBold,
  },
});
