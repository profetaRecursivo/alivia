import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Cuerpo estándar de BottomSheet. El scrim y la presentación modal
 * los aporta el navegador (Stack `presentation: 'modal'` o 'transparentModal').
 * Título de sheet SIEMPRE 20 px PJS Bold.
 */
export function Sheet({ title, subtitle, children, footer, style }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingBottom: Spacing.xxl + insets.bottom }, style]}>
      <View style={styles.grabber} />
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingHorizontal: Spacing.gutter,
    ...Shadows.sheet,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.borderStrong,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  header: { marginBottom: Spacing.lg },
  title: {
    fontSize: Typography.scale.modalTitle,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  body: { gap: Spacing.md },
  footer: { marginTop: Spacing.lg, gap: Spacing.sm },
});
