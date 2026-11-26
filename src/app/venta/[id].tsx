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
import {
  Check,
  CircleAlert,
  Minus,
  Package,
  Plus,
  RotateCcw,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Badge, Button, ConfirmDialog, Sheet } from '@/components/ui';
import { formatBs, formatQty } from '@/lib/format';
import { toneForDays } from '@/lib/demo-data';
import { sellBatch, useLot } from '@/lib/repository';

const DEFAULT_QTY = 10;

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

export default function RegistrarVentaScreen() {
  const router = useRouter();
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const lot = useLot(id);
  const [raw, setRaw] = useState(() =>
    String(Math.min(DEFAULT_QTY, lot?.stock ?? 0))
  );
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const max = lot?.stock ?? 0;
  const qty = raw === '' ? 0 : Number(raw);
  const expired = Boolean(lot && lot.daysToExpire < 0);
  const noStock = max <= 0;
  const zero = raw === '' || qty === 0;
  const over = qty > max;
  const invalid = !lot || expired || noStock || zero || !Number.isInteger(qty) || over;
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

  const openConfirmation = () => {
    if (invalid || saving) return;
    setConfirming(true);
  };

  const register = async () => {
    if (invalid || saving) return;
    setConfirming(false);
    setSaving(true);
    setSubmitError(null);
    try {
      await sellBatch(lot.id, qty);
      router.replace({
        pathname: '/venta-exitosa',
        params: {
          // Contrato nuevo (Int 2).
          name: lot.name,
          lot: lot.lot,
          qty: String(qty),
          unit: lot.unit,
          total: total.toFixed(2),
          remaining: String(remaining),
          origin: origin === 'stock' ? 'stock' : 'vencer',
          // Compatibilidad con la pantalla actual mientras Int 2 la reescribe.
          nombre: lot.name,
          cantidad: String(qty),
        },
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo registrar la venta.'
      );
    } finally {
      setSaving(false);
    }
  };

  const badgeTone = toneForDays(days);
  const primaryIconColor = invalid || saving ? Colors.textDisabled : Colors.white;
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
        importantForAccessibility={confirming ? 'no-hide-descendants' : 'no'}
        accessibilityElementsHidden
      />

      <View
        style={[
          styles.keyboard,
          { transform: [{ translateY: -keyboardHeight }] },
        ]}
        importantForAccessibility={confirming ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={confirming}
      >
        <Sheet
          title="Registrar venta"
          onRequestClose={() => router.back()}
          footer={
            <>
              <Button
                label={
                  invalid || saving
                    ? 'Confirmar venta'
                    : `Confirmar venta (${formatQty(qty, unit)})`
                }
                onPress={openConfirmation}
                variant={invalid ? 'disabled' : 'primary'}
                disabled={invalid || saving}
                loading={saving}
                icon={<Check size={18} color={primaryIconColor} />}
              />
              <Button
                label="Cancelar y mantener en lista"
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
              accessibilityLabel={`${lot.name}. ${compactDaysLabel(days)}. Lote ${lot.lot}. Disponible: ${formatQty(max, unit)}. Precio ${formatBs(lot.price)} por unidad.`}
            >
              <View style={styles.contextLeft}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {lot.name}
                </Text>
                <Badge label={compactDaysLabel(days)} tone={badgeTone} />
              </View>
              <Text style={styles.meta}>
                Lote {lot.lot} · Disponible:{' '}
                <Text style={styles.metaStrong}>{formatQty(max, unit)}</Text>
              </Text>
            </View>

            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>PRECIO</Text>
              <Text style={styles.priceValue}>{formatBs(lot.price)}</Text>
              <Text style={styles.priceUnit}>por unidad</Text>
            </View>
          </View>

          {expired ? (
            <View
              style={styles.blockedBanner}
              accessible
              accessibilityLiveRegion="polite"
              accessibilityLabel="Venta bloqueada. Lote vencido. Retirá el lote del estante y descartalo."
            >
              <CircleAlert size={16} color={Colors.critical.text} />
              <Text style={styles.blockedText}>
                Venta bloqueada (Vencido). Retirá el lote del estante y descartalo.
              </Text>
            </View>
          ) : noStock ? (
            <View
              style={styles.blockedBanner}
              accessible
              accessibilityLiveRegion="polite"
              accessibilityLabel="Sin stock en estante. No hay unidades disponibles para vender."
            >
              <CircleAlert size={16} color={Colors.attention.text} />
              <Text style={[styles.blockedText, styles.blockedTextAttention]}>
                Sin stock en estante. No hay unidades disponibles para vender.
              </Text>
            </View>
          ) : null}

          {!expired && !noStock ? (
            <View style={[styles.quantityCard, invalid && styles.quantityCardError]}>
            <View
              style={styles.labelRow}
              accessible
              accessibilityLabel="Cantidad a vender, obligatorio"
            >
              <Text style={styles.label}>CANTIDAD A VENDER</Text>
              <Text style={styles.asterisk}>*</Text>
            </View>

            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepButton, qty <= 1 && styles.stepButtonDisabled]}
                onPress={() => setQuantity(qty - 1)}
                disabled={qty <= 1 || expired || noStock || saving}
                accessibilityRole="button"
                accessibilityLabel="Restar una unidad"
              >
                <Minus
                  size={20}
                  color={qty <= 1 ? Colors.textDisabled : Colors.primary}
                />
              </TouchableOpacity>

              <View
                style={[
                  styles.inputBox,
                  invalid && !expired && !noStock && styles.inputBoxError,
                ]}
              >
                <TextInput
                  value={raw}
                  onChangeText={onChangeText}
                  keyboardType="number-pad"
                  maxLength={6}
                  selectTextOnFocus
                  editable={!expired && !noStock && !saving}
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  style={[
                    styles.input,
                    invalid && !expired && !noStock && styles.inputError,
                  ]}
                  accessibilityLabel="Cantidad a vender"
                  accessibilityHint={`Entre 1 y ${formatQty(max, unit)}`}
                />
                <Text style={styles.inputUnit}>{unit.toUpperCase()}</Text>
              </View>

              <TouchableOpacity
                style={[styles.stepButton, styles.stepButtonPrimary]}
                onPress={() => setQuantity(qty + 1)}
                disabled={qty >= max || expired || noStock || saving}
                accessibilityRole="button"
                accessibilityLabel="Sumar una unidad"
              >
                <Plus size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {invalid && !expired && !noStock ? (
              <>
                <View
                  style={styles.errorBox}
                  accessible
                  accessibilityLiveRegion="polite"
                  accessibilityLabel={`Cantidad no válida. ${availableSentence(max, unit)}`}
                >
                  <CircleAlert size={16} color={Colors.critical.text} />
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
            ) : (
              <>
                <View
                  style={styles.feedbackPill}
                  accessible
                  accessibilityLabel={`Quedarán ${remaining} en estante. Total ${formatBs(total)}.`}
                >
                  <Text style={styles.feedbackText}>
                    Quedarán:{' '}
                    <Text style={styles.feedbackStrong}>{remaining} en estante</Text>
                  </Text>
                  <Text style={styles.feedbackDot}>·</Text>
                  <Text style={styles.feedbackTotal}>{formatBs(total)} total</Text>
                </View>

                <TouchableOpacity
                  style={styles.shortcut}
                  onPress={() => setQuantity(max)}
                  disabled={expired || noStock || saving}
                  accessibilityRole="button"
                  accessibilityLabel={`Vender todo el lote restante, ${formatQty(max, unit)}`}
                >
                  <Package size={14} color={Colors.primary} />
                  <Text style={styles.shortcutText}>
                    Vender todo el lote restante ({max} unidades)
                  </Text>
                </TouchableOpacity>
              </>
            )}
            </View>
          ) : null}

          {submitError ? (
            <Text style={styles.submitError} accessibilityLiveRegion="polite">
              {submitError}
            </Text>
          ) : null}
          </ScrollView>
        </Sheet>
      </View>

      {confirming ? (
        <ConfirmDialog
          title="¿Confirmar venta?"
          subtitle="Se actualizará el stock de mostrador en tiempo real"
          rows={[
            { label: 'Cantidad a despachar:', value: formatQty(qty, unit) },
            { label: 'Importe calculado:', value: formatBs(total), emphasis: true },
            {
              label: 'Quedarán en estante:',
              value: `${remaining} ${remaining === 1 ? singularUnit(unit) : unit}`,
            },
          ]}
          primaryLabel="Sí, registrar venta"
          onPrimary={register}
          secondaryLabel="Volver a editar cantidad"
          onSecondary={() => setConfirming(false)}
          onClose={() => setConfirming(false)}
        />
      ) : null}
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
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  contextLeft: { flex: 1, gap: Spacing.xs },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: Typography.scale.h2,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.textAlt,
  },
  meta: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  metaStrong: {
    fontFamily: Typography.fontFamilyBold,
    color: Colors.textAlt,
  },
  priceBlock: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    paddingLeft: Spacing.md,
    alignItems: 'flex-start',
    gap: 2,
  },
  priceLabel: {
    fontSize: Typography.scale.label,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  priceValue: {
    fontSize: Typography.scale.price,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.textAlt,
  },
  priceUnit: {
    fontSize: Typography.scale.micro,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textMuted,
  },

  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.critical.bg,
    borderWidth: 1,
    borderColor: Colors.critical.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  blockedText: {
    flex: 1,
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.critical.text,
    lineHeight: 17,
  },
  blockedTextAttention: { color: Colors.attention.text },

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
    fontSize: Typography.scale.label,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  asterisk: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.critical.text,
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  stepButtonDisabled: {
    backgroundColor: Colors.field,
    borderColor: Colors.field,
  },
  stepButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  inputBox: {
    flex: 1,
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
  },
  inputBoxError: { borderBottomColor: Colors.critical.border },
  input: {
    minWidth: 56,
    textAlign: 'center',
    fontSize: Typography.scale.hero,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.textAlt,
    padding: 0,
  },
  inputError: { color: Colors.critical.text },
  inputUnit: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.textMuted,
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

  feedbackPill: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  feedbackText: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.textMuted,
  },
  feedbackStrong: {
    fontFamily: Typography.fontFamilyBold,
    color: Colors.textAlt,
  },
  feedbackDot: {
    fontSize: Typography.scale.metadata,
    color: Colors.borderStrong,
  },
  feedbackTotal: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.textAlt,
  },

  shortcut: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  shortcutText: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.primary,
    textAlign: 'center',
  },

  submitError: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.critical.text,
    textAlign: 'center',
  },
});
