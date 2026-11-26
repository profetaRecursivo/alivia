import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Button } from './Button';

export type ConfirmRow = { label: string; value: string; emphasis?: boolean };

type Props = {
  title: string;
  subtitle?: string;
  rows?: ConfirmRow[];
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  /** Cierra tocando el scrim (equivale a la acción secundaria). */
  onClose?: () => void;
};

/**
 * Diálogo de confirmación (Figma: "¿Confirmar venta?" / "¿Descartar unidades de estante?").
 * Se monta ENCIMA del BottomSheet, nunca reemplaza la pantalla.
 */
export function ConfirmDialog({
  title,
  subtitle,
  rows = [],
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}: Props) {
  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose ?? onSecondary}
        accessible={false}
        importantForAccessibility="no"
      />
      <View style={styles.card}>
        <Text style={styles.title} accessibilityRole="header">{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {rows.length > 0 ? (
          <View style={styles.rows}>
            {rows.map((row) => (
              <View key={row.label} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={[styles.rowValue, row.emphasis && styles.rowValueEmphasis]}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button label={primaryLabel} onPress={onPrimary} variant="primary" />
          <Button label={secondaryLabel} onPress={onSecondary} variant="secondary" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.modal,
  },
  title: {
    fontSize: Typography.scale.modalTitle,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  rows: {
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.text,
    textAlign: 'right',
  },
  rowValueEmphasis: {
    fontSize: Typography.scale.price,
    fontFamily: Typography.fontFamilyBold,
  },
  actions: { marginTop: Spacing.xl, gap: Spacing.sm },
});
