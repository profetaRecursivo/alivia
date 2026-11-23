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
import { X, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { Colors, Spacing } from '@/constants/theme';

const MOTIVOS_DESCARTE = [
  { id: 'vencido', label: 'Producto vencido' },
  { id: 'dano_fisico', label: 'Daño físico / rotura' },
  { id: 'empaque_comprometido', label: 'Empaque roto o abierto' },
  { id: 'cadena_frio', label: 'Pérdida de cadena de frío' },
  { id: 'otro', label: 'Otro motivo' },
];

export default function DescartarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock del producto y lote a descartar
  const productoMock = {
    id: id || '2',
    name: 'Amoxicilina 500mg',
    form: 'Cápsulas',
    lote: {
      code: 'L-2023-089',
      stock: 12,
      expires_at: '2026-11-20',
      isExpired: true,
    },
  };

  const [quantity, setQuantity] = useState(String(productoMock.lote.stock));
  const [selectedMotivo, setSelectedMotivo] = useState('vencido');
  const [detailReason, setDetailReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmDescarte = () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Ingrese una cantidad válida mayor a 0');
      return;
    }
    if (qty > productoMock.lote.stock) {
      Alert.alert('Error', `La cantidad a descartar supera el stock del lote (${productoMock.lote.stock})`);
      return;
    }
    if (!selectedMotivo) {
      Alert.alert('Error', 'Debe seleccionar un motivo de descarte');
      return;
    }

    Alert.alert(
      '¿Confirmar descarte?',
      `Se darán de baja permanente ${qty} unidades del lote ${productoMock.lote.code}. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Baja',
          style: 'destructive',
          onPress: () => {
            setSubmitting(true);
            setTimeout(() => {
              setSubmitting(false);
              Alert.alert(
                'Descarte registrado',
                `Se registraron ${qty} unidades en el historial de bajas y mermas.`,
                [{ text: 'Aceptar', onPress: () => router.back() }]
              );
            }, 600);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Trash2 size={22} color={Colors.light.danger} />
          <Text style={styles.headerTitle}>Descartar / Baja de Lote</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Advertencia visual destacada */}
        <View style={styles.alertCard}>
          <AlertTriangle size={24} color="#B91C1C" style={{ marginTop: 2 }} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Registro de merma o baja irreversible</Text>
            <Text style={styles.alertText}>
              Este producto se retirará del inventario disponible y se auditará en el historial con fecha, responsable y motivo.
            </Text>
          </View>
        </View>

        {/* Info del producto y lote */}
        <View style={styles.productBanner}>
          <Text style={styles.productName}>{productoMock.name}</Text>
          <Text style={styles.productForm}>{productoMock.form}</Text>
          <View style={styles.loteRow}>
            <Text style={styles.loteLabel}>Lote:</Text>
            <Text style={styles.loteCode}>{productoMock.lote.code}</Text>
            <Text style={styles.loteStock}>• Stock en lote: {productoMock.lote.stock} uds.</Text>
          </View>
        </View>

        {/* Cantidad a descartar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cantidad a dar de baja</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <TouchableOpacity
              style={styles.allBtn}
              onPress={() => setQuantity(String(productoMock.lote.stock))}>
              <Text style={styles.allBtnText}>Todo el lote ({productoMock.lote.stock})</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selector de Motivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motivo obligatorio de descarte</Text>
          <View style={styles.motivosList}>
            {MOTIVOS_DESCARTE.map((item) => {
              const isSelected = selectedMotivo === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.motivoOption, isSelected && styles.motivoOptionSelected]}
                  onPress={() => setSelectedMotivo(item.id)}>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.motivoText, isSelected && styles.motivoTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Detalle opcional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles adicionales</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Ej. Notado en revisión matutina, frasco cuarteado"
            placeholderTextColor="#94A3B8"
            value={detailReason}
            onChangeText={setDetailReason}
            multiline
            numberOfLines={2}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={submitting}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerButton, submitting && styles.dangerButtonDisabled]}
          onPress={handleConfirmDescarte}
          disabled={submitting}>
          <Trash2 size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.dangerButtonText}>
            {submitting ? 'Procesando...' : 'Confirmar Descarte'}
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
    color: Colors.light.danger,
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: Spacing.four,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 2,
  },
  alertText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },
  productBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
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
  loteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  loteLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  loteCode: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: Colors.light.text,
  },
  loteStock: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: Colors.light.textTertiary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityInput: {
    width: 100,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.light.text,
    textAlign: 'center',
  },
  allBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  allBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  motivosList: {
    gap: 8,
  },
  motivoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  motivoOptionSelected: {
    borderColor: Colors.light.danger,
    backgroundColor: '#FEF2F2',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.light.danger,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.danger,
  },
  motivoText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: Colors.light.text,
  },
  motivoTextSelected: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#991B1B',
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
  dangerButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.light.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonDisabled: {
    opacity: 0.6,
  },
  dangerButtonText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
