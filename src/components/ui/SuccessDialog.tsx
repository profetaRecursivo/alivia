import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, X } from 'lucide-react-native';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Button } from './Button';

type SummaryItem = { label: string; value: string };

type Props = {
  title: string;
  message: string;
  /** Línea destacada opcional (p. ej. "10 comprimidos · Bs. 145.00"). */
  detail?: string;
  /** Resumen en dos columnas (cantidad / total). */
  summary?: SummaryItem[];
  /** Nota al pie (stock restante, motivo). */
  note?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Cerrar tocando el scrim o la ✕. */
  onClose?: () => void;
};

/**
 * Diálogo de éxito 100% reusable por las dos confirmaciones nuevas
 * (venta exitosa y descarte exitoso). Fondo atenuado + tarjeta centrada.
 * Título 20 PJS Bold, cuerpo 13, icono de éxito verde.
 */
export function SuccessDialog({
  title,
  message,
  detail,
  summary,
  note,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}: Props) {
  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="Cerrar"
      />
      <View style={styles.card}>
        {onClose ? (
          <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={8}>
            <X size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.iconWrap}>
          <CheckCircle2 size={40} color={Colors.success.accent} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}

        {summary && summary.length > 0 ? (
          <View style={styles.summary}>
            {summary.map((item) => (
              <View key={item.label} style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={styles.summaryValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {note ? <Text style={styles.note}>{note}</Text> : null}

        <View style={styles.actions}>
          <Button label={primaryLabel} onPress={onPrimary} variant="primary" />
          {secondaryLabel && onSecondary ? (
            <Button label={secondaryLabel} onPress={onSecondary} variant="ghost" />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
    alignItems: 'center',
    ...Shadows.modal,
  },
  close: { position: 'absolute', top: Spacing.md, right: Spacing.md, padding: Spacing.xs },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.scale.modalTitle,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 19,
  },
  detail: {
    fontSize: Typography.scale.price,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  summary: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    backgroundColor: Colors.field,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  summaryColumn: { flex: 1, alignItems: 'center', gap: Spacing.one },
  summaryLabel: {
    fontSize: Typography.scale.label,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: Typography.scale.brand,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
    textAlign: 'center',
  },
  note: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  actions: { alignSelf: 'stretch', marginTop: Spacing.xl, gap: Spacing.sm },
});
