import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, ShoppingCart, Minus, Plus, AlertCircle } from 'lucide-react-native';
import { Colors, Spacing } from '@/constants/theme';

export default function RegistrarVentaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock de datos del producto y lote recomendado FEFO
  const productoMock = {
    id: id || '1',
    name: 'Ibuprofeno 400mg',
    form: 'Tabletas',
    loteRecomendado: {
      id: 'lote-101',
      code: 'L-2024-001',
      stock: 35,
      expires_at: '2026-11-28',
      daysUntil: 5,
    },
    totalStock: 85,
  };

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const maxStock = productoMock.loteRecomendado.stock;

  const handleIncrement = () => {
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSaveVenta = async () => {
    if (quantity <= 0) {
      Alert.alert('Error', 'La cantidad vendida debe ser mayor a 0');
      return;
    }
    if (quantity > maxStock) {
      Alert.alert('Error', `Stock insuficiente en lote FEFO (Máx. ${maxStock})`);
      return;
    }

    setSubmitting(true);
    // Simular registro en base de datos local y sincronización
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Venta registrada',
        `Se descontaron ${quantity} unidades del lote ${productoMock.loteRecomendado.code} (Criterio FEFO aplicado).`,
        [{ text: 'Aceptar', onPress: () => router.back() }]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShoppingCart size={22} color={Colors.light.primary} />
          <Text style={styles.headerTitle}>Registrar Venta</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner de Producto */}
        <View style={styles.productBanner}>
          <Text style={styles.productName}>{productoMock.name}</Text>
          <Text style={styles.productForm}>{productoMock.form}</Text>
        </View>

        {/* Lote asignado por FEFO */}
        <View style={styles.fefoCard}>
          <View style={styles.fefoBadge}>
            <Text style={styles.fefoBadgeText}>REGLA FEFO ACTIVA</Text>
          </View>
          <Text style={styles.fefoTitle}>Lote asignado para salida prioritaria:</Text>
          <Text style={styles.fefoLoteCode}>{productoMock.loteRecomendado.code}</Text>
          <Text style={styles.fefoInfo}>
            Vence: {productoMock.loteRecomendado.expires_at} ({productoMock.loteRecomendado.daysUntil} días restantes)
          </Text>
          <Text style={styles.fefoStock}>
            Stock disponible en este lote: <Text style={{ fontWeight: '700' }}>{maxStock} uds.</Text>
          </Text>
        </View>

        {/* Stepper de Cantidad */}
        <View style={styles.stepperContainer}>
          <Text style={styles.stepperLabel}>Cantidad a vender</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, quantity <= 1 && styles.stepperBtnDisabled]}
              onPress={handleDecrement}
              disabled={quantity <= 1}>
              <Minus size={22} color={quantity <= 1 ? '#94A3B8' : Colors.light.primary} />
            </TouchableOpacity>

            <View style={styles.quantityBox}>
              <Text style={styles.quantityValue}>{quantity}</Text>
            </View>

            <TouchableOpacity
              style={[styles.stepperBtn, quantity >= maxStock && styles.stepperBtnDisabled]}
              onPress={handleIncrement}
              disabled={quantity >= maxStock}>
              <Plus size={22} color={quantity >= maxStock ? '#94A3B8' : Colors.light.primary} />
            </TouchableOpacity>
          </View>
          {quantity >= maxStock && (
            <View style={styles.warningRow}>
              <AlertCircle size={14} color="#D97706" />
              <Text style={styles.warningText}>Cantidad máxima alcanzada para este lote</Text>
            </View>
          )}
        </View>

        {/* Notas u observaciones */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Observación (Opcional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Ej. Venta en mostrador con receta médica"
            placeholderTextColor="#94A3B8"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={submitting}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
          onPress={handleSaveVenta}
          disabled={submitting}>
          <Check size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.confirmButtonText}>
            {submitting ? 'Guardando...' : `Confirmar Venta (${quantity})`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.light.text,
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: Spacing.four,
  },
  productBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  productName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.light.text,
  },
  productForm: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  fefoCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  fefoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  fefoBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: '#15803D',
  },
  fefoTitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: '#166534',
  },
  fefoLoteCode: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: '#14532D',
    marginTop: 2,
  },
  fefoInfo: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: '#166534',
    marginTop: 2,
  },
  fefoStock: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: '#166534',
    marginTop: 6,
  },
  stepperContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  stepperLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FA',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    borderColor: '#CBD5E1',
    backgroundColor: '#F1F5F9',
  },
  quantityBox: {
    minWidth: 70,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  quantityValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    color: Colors.light.text,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  warningText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: '#D97706',
  },
  notesContainer: {
    marginTop: 16,
  },
  notesLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 6,
  },
  notesInput: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 12,
    color: Colors.light.text,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
