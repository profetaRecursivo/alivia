import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Button, Chip, ConfirmDialog, Sheet } from '@/components/ui';

// INTEGRANTE 4 / 6: Descartar (BottomSheet) + validación de motivo + Descarte exitoso.
// Fuente visual: Figma 371:2238 / 349:18 (sheet), 496:126 (popup de confirmación).

const PRODUCTO = {
  nombre: 'Ibuprofeno 400 mg',
  lote: 'IB-449',
  stock: 200,
};

const MOTIVOS = [
  { id: 'vencido', label: 'Vencido' },
  { id: 'danado', label: 'Dañado' },
  { id: 'devolucion', label: 'Devolución a droguería' },
] as const;

export default function DescartarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  void id;

  const [cantidad, setCantidad] = useState(0);
  const [texto, setTexto] = useState('');
  const [motivo, setMotivo] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const errorCantidad = useMemo(() => {
    if (cantidad === 0) return null;
    if (cantidad > PRODUCTO.stock)
      return `Ingresa un número entre 1 y ${PRODUCTO.stock} comprimidos disponibles en el estante.`;
    return null;
  }, [cantidad]);

  const faltaMotivo = !motivo;
  const bloqueado = faltaMotivo || cantidad <= 0 || !!errorCantidad;
  const motivoLabel = MOTIVOS.find((m) => m.id === motivo)?.label ?? '';
  const restante = Math.max(PRODUCTO.stock - cantidad, 0);

  const onChangeTexto = (valor: string) => {
    const soloDigitos = valor.replace(/[^0-9]/g, '');
    setTexto(soloDigitos);
    setCantidad(soloDigitos === '' ? 0 : parseInt(soloDigitos, 10));
  };

  const usarTodo = () => {
    setCantidad(PRODUCTO.stock);
    setTexto(String(PRODUCTO.stock));
  };

  const descartar = () => {
    setConfirmando(false);
    router.replace({
      pathname: '/descarte-exitoso',
      params: {
        nombre: PRODUCTO.nombre,
        cantidad: String(cantidad),
        motivo: motivoLabel,
      },
    });
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => router.back()}
        accessibilityLabel="Cerrar"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Sheet
          title="Descartar"
          subtitle="Revisa y marca según lo que vendas o retires en el mostrador"
          footer={
            <>
              <Button
                label="Confirmar descarte"
                onPress={() => setConfirmando(true)}
                variant={bloqueado ? 'disabled' : 'primary'}
                disabled={bloqueado}
              />
              <Button
                label="Cancelar y mantener en lista"
                onPress={() => router.back()}
                variant="ghost"
              />
            </>
          }
        >
          {/* Lote */}
          <View style={styles.loteRow}>
            <Trash2 size={16} color={Colors.textSecondary} />
            <Text style={styles.lote}>
              Lote: {PRODUCTO.lote} · Disponible: {PRODUCTO.stock} comprimidos
            </Text>
          </View>

          {/* Motivo obligatorio */}
          <Text style={styles.label}>MOTIVO DEL RETIRO *</Text>
          <View style={styles.chips}>
            {MOTIVOS.map((m) => (
              <Chip
                key={m.id}
                label={m.label}
                selected={motivo === m.id}
                onPress={() => setMotivo(m.id)}
              />
            ))}
          </View>

          {/* Cantidad */}
          <Text style={styles.label}>CANTIDAD A DESCARTAR *</Text>
          <View style={styles.cantidadRow}>
            <TextInput
              value={texto}
              onChangeText={onChangeTexto}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              style={[styles.input, !!errorCantidad && styles.inputError]}
              accessibilityLabel="Cantidad a descartar"
            />
            <Text style={styles.inputUnit}>Comprimidos</Text>
            <TouchableOpacity onPress={usarTodo} hitSlop={8}>
              <Text style={styles.quickAction}>Usar todo ({PRODUCTO.stock})</Text>
            </TouchableOpacity>
          </View>

          {errorCantidad ? (
            <Text style={styles.error}>{errorCantidad}</Text>
          ) : faltaMotivo ? (
            <Text style={styles.helper}>
              Debes seleccionar obligatoriamente un motivo para auditar la baja.
            </Text>
          ) : null}
        </Sheet>
      </KeyboardAvoidingView>

      {confirmando ? (
        <ConfirmDialog
          title="¿Descartar unidades de estante?"
          subtitle="Se registrará en el Historial"
          rows={[
            { label: 'Cantidad a descartar', value: `${cantidad} comprimidos` },
            { label: 'Motivo seleccionado', value: motivoLabel, emphasis: true },
            { label: 'Quedarán disponibles', value: `${restante} comprimidos` },
          ]}
          primaryLabel="Confirmar descarte"
          onPrimary={descartar}
          secondaryLabel="Cancelar y conservar en lista"
          onSecondary={() => setConfirmando(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.scrim },
  keyboard: { justifyContent: 'flex-end' },

  loteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  lote: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: Typography.scale.label,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cantidadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  input: {
    minWidth: 84,
    fontSize: Typography.scale.hero,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    textAlign: 'center',
  },
  inputError: { borderColor: Colors.critical.border, backgroundColor: Colors.critical.bg },
  inputUnit: {
    flex: 1,
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
  },
  quickAction: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.primary,
  },
  error: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.critical.text,
  },
  helper: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.textSecondary,
  },
});
