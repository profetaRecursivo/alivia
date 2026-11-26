import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlert, Minus, Plus, RotateCcw, X } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Badge, Button, Chip, Sheet } from '@/components/ui';
import { formatQty } from '@/lib/format';
import {
  DISCARD_REASONS,
  reasonLabel,
  toneForDays,
  type DiscardReason,
} from '@/lib/demo-data';
import { discardBatch, useLot } from '@/lib/repository';

const DEFAULT_QTY = 5;

function compactDaysLabel(days: number): string {
  if (days < 0) return 'Vencido';
  if (days === 0) return 'Vence hoy';
  if (days === 1) return '1 día';
  return `${days} días`;
}

function singularUnit(unit: string): string {
  if (unit === 'unidades') return 'unidad';
  return unit.replace(/s$/, '');
}

function availableSentence(max: number, unit: string): string {
  if (max <= 0) return 'No hay unidades disponibles en el estante.';
  if (max === 1) return `Ingresa 1 ${singularUnit(unit)} disponible en el estante.`;
  return `Ingresa un número entre 1 y ${formatQty(max, unit)} disponibles en el estante.`;
}

export default function DescartarScreen() {
  const router = useRouter();
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const lot = useLot(id);
  const [raw, setRaw] = useState(() =>
    String(Math.min(DEFAULT_QTY, lot?.stock ?? 0))
  );
  const [reason, setReason] = useState<DiscardReason | null>(() =>
    lot && lot.daysToExpire < 0 ? 'EXPIRED' : null
  );
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const max = lot?.stock ?? 0;
  const qty = raw === '' ? 0 : Number(raw);
  const zero = raw === '' || qty === 0;
  const over = qty > max;
  const quantityInvalid = !lot || max <= 0 || zero || !Number.isInteger(qty) || over;
  const reasonError = !reason && !quantityInvalid;
  const canConfirm = Boolean(lot) && !quantityInvalid && Boolean(reason);
  const total = qty * (lot?.price ?? 0);
  const remaining = Math.max(max - qty, 0);
  const unit = lot?.unit ?? 'unidades';
  const days = lot?.daysToExpire ?? 0;

  useEffect(() => {
    if (submitError) AccessibilityInfo.announceForAccessibility(submitError);
  }, [submitError]);

  useEffect(() => {
    const handleShow = (event: { endCoordinates: { height: number } }) => {
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    };
    const handleHide = () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    };
    const subscriptions = [
      Keyboard.addListener('keyboardWillShow', handleShow),
      Keyboard.addListener('keyboardDidShow', handleShow),
      Keyboard.addListener('keyboardWillHide', handleHide),
      Keyboard.addListener('keyboardDidHide', handleHide),
    ];
    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  if (!lot) {
    return (
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => router.back()}
          accessibilityLabel="Cerrar"
        />
        <Sheet
          title="Lote no encontrado"
          footer={
            <Button label="Volver" onPress={() => router.back()} variant="primary" />
          }
        >
          <Text style={styles.fallbackText}>
            No se encontró el lote solicitado. Volvé a la lista y elegí un medicamento
            disponible.
          </Text>
        </Sheet>
      </View>
    );
  }

  const setQuantity = (value: number) => {
    const safe = Number.isFinite(value) ? Math.trunc(value) : 0;
    setRaw(String(Math.max(0, Math.min(safe, 999999))));
    setSubmitError(null);
  };

  const onChangeText = (value: string) => {
    setRaw(value.replace(/\D/g, '').slice(0, 6));
    setSubmitError(null);
  };

  const applyQuickAction = () => {
    if (zero) {
      setQuantity(max > 0 ? 1 : 0);
      return;
    }
    setQuantity(max);
  };

  const discard = async () => {
    if (!lot || !reason || !canConfirm || saving) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await discardBatch(lot.id, qty, reason);
      router.replace({
        pathname: '/descarte-exitoso',
        params: {
          // Contrato nuevo (Int 6).
          name: lot.name,
          lot: lot.lot,
          qty: String(qty),
          unit: lot.unit,
          total: total.toFixed(2),
          remaining: String(remaining),
          reason: reasonLabel(reason),
          origin: origin === 'stock' ? 'stock' : 'vencer',
          // Compatibilidad con la pantalla actual mientras Int 6 la reescribe.
          nombre: lot.name,
          cantidad: String(qty),
          motivo: reasonLabel(reason),
        },
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo registrar el descarte.'
      );
    } finally {
      setSaving(false);
    }
  };

  const badgeTone = toneForDays(days);
  const iconColor = canConfirm && !saving ? Colors.white : Colors.textDisabled;
  const quickActionLabel = zero
    ? 'Usar 1 unidad'
    : over
      ? `Ajustar al máximo disponible (${max} ${max === 1 ? 'unidad' : 'unidades'})`
      : '';

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => router.back()}
        accessible={false}
        importantForAccessibility="no"
        accessibilityElementsHidden
      />

      <View
        style={[
          styles.keyboard,
          { transform: [{ translateY: -keyboardHeight }] },
        ]}
      >
        <Sheet
          title="Descartar"
          onRequestClose={() => router.back()}
          footer={
            <>
              <Button
                label={
                  quantityInvalid
                    ? 'Confirmar descarte'
                    : `Confirmar descarte (${formatQty(qty, unit)})`
                }
                onPress={discard}
                variant={canConfirm ? 'primary' : 'disabled'}
                disabled={!canConfirm || saving}
                loading={saving}
                icon={<X size={18} color={iconColor} />}
              />
              <Button
                label="Cancelar y conservar en lista"
                onPress={() => router.back()}
                variant="ghost"
              />
            </>
          }
        >
          <ScrollView
            style={keyboardVisible ? styles.bodyScrollKeyboard : undefined}
            contentContainerStyle={styles.bodyScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={styles.contextCard}
              accessible
              accessibilityLabel={`${lot.name}. ${compactDaysLabel(days)}. Lote ${lot.lot}. Disponible: ${formatQty(max, unit)}.`}
            >
              <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {lot.name}
              </Text>
              <Badge label={compactDaysLabel(days)} tone={badgeTone} />
            </View>
            <Text style={styles.meta}>
              Lote: {lot.lot} · Disponible:{' '}
              <Text style={styles.metaStrong}>{formatQty(max, unit)}</Text>
            </Text>
          </View>

          <View
            style={[styles.quantityCard, quantityInvalid && styles.quantityCardError]}
          >
            <View
              style={styles.labelRow}
              accessible
              accessibilityLabel="Cantidad a descartar, obligatorio"
            >
              <Text style={styles.label}>CANTIDAD A DESCARTAR</Text>
              <Text style={styles.asterisk}>*</Text>
            </View>

            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepButton, qty <= 1 && styles.stepButtonDisabled]}
                onPress={() => setQuantity(qty - 1)}
                disabled={qty <= 1 || max <= 0 || saving}
                accessibilityRole="button"
                accessibilityLabel="Restar una unidad"
              >
                <Minus
                  size={16}
                  color={qty <= 1 ? Colors.textDisabled : Colors.primary}
                />
              </TouchableOpacity>

              <View
                style={[
                  styles.inputBox,
                  quantityInvalid && styles.inputBoxError,
                ]}
              >
                <TextInput
                  value={raw}
                  onChangeText={onChangeText}
                  keyboardType="number-pad"
                  maxLength={6}
                  selectTextOnFocus
                  editable={max > 0 && !saving}
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  style={[
                    styles.input,
                    quantityInvalid && styles.inputError,
                  ]}
                  accessibilityLabel="Cantidad a descartar"
                  accessibilityHint={`Entre 1 y ${formatQty(max, unit)}`}
                />
                <Text style={styles.inputUnit}>{unit.toUpperCase()}</Text>
              </View>

              <TouchableOpacity
                style={[styles.stepButton, styles.stepButtonPrimary]}
                onPress={() => setQuantity(qty + 1)}
                disabled={qty >= max || max <= 0 || saving}
                accessibilityRole="button"
                accessibilityLabel="Sumar una unidad"
              >
                <Plus size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {quantityInvalid ? (
              <>
                <View
                  style={styles.errorBox}
                  accessible
                  accessibilityLiveRegion="polite"
                  accessibilityLabel={`Cantidad no válida. ${availableSentence(max, unit)}`}
                >
                  <CircleAlert size={14} color={Colors.critical.text} />
                  <View style={styles.errorBody}>
                    <Text style={styles.errorTitle}>Cantidad no válida.</Text>
                    <Text style={styles.errorText}>{availableSentence(max, unit)}</Text>
                  </View>
                </View>

                {quickActionLabel ? (
                  <TouchableOpacity
                    style={styles.quickAction}
                    onPress={applyQuickAction}
                    accessibilityRole="button"
                    accessibilityLabel={quickActionLabel}
                  >
                    <RotateCcw size={14} color={Colors.primary} />
                    <Text style={styles.quickActionText}>{quickActionLabel}</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
          </View>

          <View style={styles.reasonCard}>
            <View
              style={styles.labelRow}
              accessible
              accessibilityLabel="Motivo del retiro, obligatorio"
            >
              <Text style={styles.label}>MOTIVO DEL RETIRO</Text>
              <Text style={styles.asterisk}>*</Text>
            </View>

            <View
              style={styles.chips}
              accessibilityRole="radiogroup"
              accessibilityLabel="Motivo del retiro"
            >
              {DISCARD_REASONS.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  selected={reason === item.value}
                  role="radio"
                  onPress={() => {
                    setReason(item.value);
                    setSubmitError(null);
                    AccessibilityInfo.announceForAccessibility(
                      `Motivo seleccionado: ${item.label}`
                    );
                  }}
                />
              ))}
            </View>

            {reasonError ? (
              <View
                style={styles.reasonErrorBox}
                accessible
                accessibilityLiveRegion="polite"
                accessibilityLabel="Debes seleccionar un motivo obligatorio para la baja."
              >
                <CircleAlert size={14} color={Colors.critical.text} />
                <Text style={styles.reasonErrorText}>
                  Debes seleccionar un motivo obligatorio para la baja.
                </Text>
              </View>
            ) : null}
          </View>

            {submitError ? (
              <Text style={styles.submitError} accessibilityLiveRegion="polite">
                {submitError}
              </Text>
            ) : null}
          </ScrollView>
        </Sheet>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.scrim,
  },
  keyboard: { flex: 1, justifyContent: 'flex-end' },
  bodyScrollKeyboard: { maxHeight: 220 },
  bodyScrollContent: { gap: Spacing.md },
  fallbackText: {
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  contextCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: Typography.scale.price,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.text,
  },
  meta: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  metaStrong: {
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
  },

  quantityCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  quantityCardError: { borderColor: Colors.critical.border },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  asterisk: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.critical.text,
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  stepButton: {
    width: Spacing.touchTarget,
    height: Spacing.touchTarget,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: { backgroundColor: Colors.field, borderColor: Colors.field },
  stepButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  inputBox: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
  },
  inputBoxError: { borderBottomColor: Colors.critical.border },
  input: {
    minWidth: 56,
    textAlign: 'center',
    fontSize: Typography.scale.display,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
    padding: 0,
  },
  inputError: { color: Colors.critical.text },
  inputUnit: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.textSecondary,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.critical.bg,
    borderWidth: 1,
    borderColor: Colors.critical.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  errorBody: { flex: 1, gap: 2 },
  errorTitle: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.critical.text,
  },
  errorText: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.critical.text,
    lineHeight: 17,
  },
  quickAction: {
    minHeight: Spacing.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  quickActionText: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.primaryContainerText,
    textAlign: 'center',
  },

  reasonCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  reasonErrorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.critical.bg,
    borderWidth: 1,
    borderColor: Colors.critical.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  reasonErrorText: {
    flex: 1,
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.critical.text,
    lineHeight: 17,
  },

  submitError: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.critical.text,
    textAlign: 'center',
  },
});
