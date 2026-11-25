import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'disabled';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

/**
 * Botón único de la app. Jerarquía fija (Ley de Similitud):
 *  - primary  = acción principal sólida (Vender / Confirmar).
 *  - secondary= acción secundaria outline (Descartar).
 *  - ghost    = enlace de texto.
 *  - disabled = gris no interactivo.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: Props) {
  const isDisabled = disabled || variant === 'disabled';
  const palette = getPalette(variant, isDisabled);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: palette.border === 'transparent' ? 0 : 1,
        },
        !fullWidth && styles.autoWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: palette.text }]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function getPalette(variant: ButtonVariant, disabled: boolean) {
  if (disabled) {
    return { bg: Colors.disabledBg, text: Colors.textDisabled, border: 'transparent' };
  }
  switch (variant) {
    case 'secondary':
      return { bg: Colors.field, text: Colors.textSecondary, border: Colors.borderStrong };
    case 'ghost':
      return { bg: 'transparent', text: Colors.primary, border: 'transparent' };
    case 'primary':
    default:
      return { bg: Colors.primary, text: Colors.white, border: 'transparent' };
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: Spacing.touchTarget,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  autoWidth: { alignSelf: 'flex-start' },
  label: {
    fontSize: Typography.scale.cta,
    fontFamily: Typography.fontFamilyBold,
  },
});
