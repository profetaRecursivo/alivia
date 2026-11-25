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
import { Minus, Plus, Clock3 } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Badge, Button, ConfirmDialog, Sheet } from '@/components/ui';

// INTEGRANTE 4: Registrar venta (BottomSheet) + Confirmar venta + Venta exitosa.
// Fuente visual: Figma 291:19 (sheet), 291:160 (cantidad no válida), 498:360 (confirmar).

const PRODUCTO = {
  nombre: 'Ibuprofeno 400 mg',
  presentacion: 'Comprimidos caja',
  lote: 'IB-449',
  stock: 200,
  precioUnitario: 1.5,
  diasParaVencer: 15,
};

export default function RegistrarVentaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  void id;

  const [cantidad, setCantidad] = useState(10);
  const [texto, setTexto] = useState('10');
  const [confirmando, setConfirmando] = useState(false);

  const error = useMemo(() => {
    if (cantidad <= 0) return 'La cantidad debe ser mayor a 0.';
    if (cantidad > PRODUCTO.stock)
      return `Ingresa un número entre 1 y ${PRODUCTO.stock} comprimidos disponibles en el estante.`;
    return null;
  }, [cantidad]);

  const total = cantidad * PRODUCTO.precioUnitario;
  const totalFmt = total.toFixed(2);
  const restante = Math.max(PRODUCTO.stock - cantidad, 0);

  const aplicar = (n: number) => {
    const limpio = Number.isFinite(n) ? Math.trunc(n) : 0;
    setCantidad(limpio);
    setTexto(String(limpio));
  };

  const onChangeTexto = (valor: string) => {
    const soloDigitos = valor.replace(/[^0-9]/g, '');
    setTexto(soloDigitos);
    setCantidad(soloDigitos === '' ? 0 : parseInt(soloDigitos, 10));
  };

  const registrar = () => {
    setConfirmando(false);
    router.replace({
      pathname: '/venta-exitosa',
      params: {
        nombre: PRODUCTO.nombre,
        cantidad: String(cantidad),
        total: totalFmt,
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
          title="Registrar venta"
          subtitle="Revisa y marca según lo que vendas o retires en el mostrador"
          footer={
            <>
              <Button
                label={`Confirmar venta (${cantidad} ${cantidad === 1 ? 'comprimido' : 'comprimidos'})`}
                onPress={() => setConfirmando(true)}
                variant={error ? 'disabled' : 'primary'}
                disabled={!!error}
              />
              <Button
                label="Cancelar y mantener en lista"
                onPress={() => router.back()}
                variant="ghost"
              />
            </>
          }
        >
          {/* Ficha del lote */}
          <View style={styles.producto}>
            <View style={styles.productoTop}>
              <View style={styles.productoInfo}>
                <Text style={styles.productoNombre}>{PRODUCTO.nombre}</Text>
                <Text style={styles.productoMeta}>
                  Lote {PRODUCTO.lote} · {PRODUCTO.presentacion}
                </Text>
              </View>
              <Badge label={`Vence en ${PRODUCTO.diasParaVencer} días`} tone="critical" />
            </View>
            <View style={styles.disponibleRow}>
              <Clock3 size={14} color={Colors.textSecondary} />
              <Text style={styles.disponible}>
                Disponible: {PRODUCTO.stock} comprimidos
              </Text>
            </View>
          </View>

          {/* Stepper */}
          <Text style={styles.label}>CANTIDAD A VENDER</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepBtn, cantidad <= 1 && styles.stepBtnDisabled]}
              onPress={() => aplicar(cantidad - 1)}
              disabled={cantidad <= 1}
              accessibilityLabel="Restar uno"
            >
              <Minus size={22} color={cantidad <= 1 ? Colors.textDisabled : Colors.primary} />
            </TouchableOpacity>

            <View style={[styles.inputWrap, !!error && styles.inputWrapError]}>
              <TextInput
                value={texto}
                onChangeText={onChangeTexto}
                keyboardType="number-pad"
                maxLength={4}
                style={styles.input}
                selectTextOnFocus
                accessibilityLabel="Cantidad a vender"
              />
              <Text style={styles.inputUnit}>Comprimidos</Text>
            </View>

            <TouchableOpacity
              style={[styles.stepBtn, cantidad >= PRODUCTO.stock && styles.stepBtnDisabled]}
              onPress={() => aplicar(cantidad + 1)}
              disabled={cantidad >= PRODUCTO.stock}
              accessibilityLabel="Sumar uno"
            >
              <Plus
                size={22}
                color={cantidad >= PRODUCTO.stock ? Colors.textDisabled : Colors.primary}
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Importe calculado</Text>
            <Text style={styles.totalValue}>Bs. {totalFmt}</Text>
          </View>
        </Sheet>
      </KeyboardAvoidingView>

      {confirmando ? (
        <ConfirmDialog
          title="¿Confirmar venta?"
          subtitle="Se actualizará el stock de mostrador en tiempo real"
          rows={[
            { label: 'Cantidad a despachar', value: `${cantidad} comprimidos` },
            { label: 'Importe calculado', value: `Bs. ${totalFmt}`, emphasis: true },
            { label: 'Quedarán en estante', value: `${restante} comprimidos` },
          ]}
          primaryLabel="Sí, registrar venta"
          onPrimary={registrar}
          secondaryLabel="Volver a editar cantidad"
          onSecondary={() => setConfirmando(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.scrim },
  keyboard: { justifyContent: 'flex-end' },

  producto: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  productoTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  productoInfo: { flex: 1 },
  productoNombre: {
    fontSize: Typography.scale.h2,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.text,
  },
  productoMeta: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  disponibleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  disponible: {
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  stepBtn: {
    width: Spacing.touchTarget,
    height: Spacing.touchTarget,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { backgroundColor: Colors.field, borderColor: Colors.field },
  inputWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
  },
  inputWrapError: { borderColor: Colors.critical.border, backgroundColor: Colors.critical.bg },
  input: {
    minWidth: 96,
    textAlign: 'center',
    fontSize: Typography.scale.hero,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
    padding: 0,
  },
  inputUnit: {
    fontSize: Typography.scale.micro,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  error: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.critical.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: Typography.scale.price,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
  },
});
