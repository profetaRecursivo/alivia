import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

export type BadgeTone = 'critical' | 'attention' | 'regular' | 'success' | 'info' | 'neutral';

const TONES: Record<BadgeTone, { bg: string; text: string; border: string }> = {
  critical: { bg: Colors.critical.bg, text: Colors.critical.text, border: Colors.critical.border },
  attention: { bg: Colors.attention.bg, text: Colors.attention.text, border: Colors.attention.border },
  regular: { bg: Colors.regular.bg, text: Colors.regular.text, border: Colors.regular.border },
  success: { bg: Colors.success.bg, text: Colors.success.text, border: Colors.success.border },
  info: { bg: Colors.info.bg, text: Colors.info.text, border: Colors.info.border },
  neutral: { bg: Colors.field, text: Colors.textSecondary, border: Colors.border },
};

type Props = {
  label: string;
  tone?: BadgeTone;
  /** 'solid' para badges de cifra (fondo fuerte). */
  solid?: boolean;
};

/** Badge/pastilla del semáforo FEFO. Única fuente de verdad de color. */
export function Badge({ label, tone = 'neutral', solid = false }: Props) {
  const c = TONES[tone];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: solid ? c.text : c.bg, borderColor: solid ? c.text : c.border },
      ]}
    >
      <Text style={[styles.label, { color: solid ? Colors.white : c.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  label: {
    fontSize: Typography.scale.label,
    fontFamily: Typography.fontFamilyMedium,
    letterSpacing: 0.2,
  },
});
