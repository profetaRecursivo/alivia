import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { ArrowLeft, AlertOctagon, Check } from 'lucide-react-native';

// INTEGRANTE 3: Ficha Detalle del Producto (Decisión Rápida y Bloqueo de Vencidos)
export default function DetalleProductoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Ejemplo: Fármaco en estado crítico / vencido
  const isExpired = false; // Cambiar a true para ver estado bloqueado

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Detalle del producto</Text>
      <Text style={styles.subtitle}>Ficha de decisión rápida</Text>

      {/* Banner de Lote Vencido (Si aplica) */}
      {isExpired && (
        <View style={styles.expiredBanner}>
          <AlertOctagon size={20} color={Colors.critical.text} />
          <Text style={styles.expiredText}>
            LOTE VENCIDO: Venta bloqueada por seguridad. Debe ser retirado del estante.
          </Text>
        </View>
      )}

      {/* Tarjeta de Información Principal */}
      <View style={styles.card}>
        <Text style={styles.medCategory}>MEDICAMENTO</Text>
        <Text style={styles.medName}>Ibuprofeno 400 mg</Text>
        <Text style={styles.medDesc}>Antiinflamatorio y analgésico oral · Lab. IFA</Text>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Cantidad en estante</Text>
            <Text style={styles.gridValue}>5 unidades</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Número de lote</Text>
            <Text style={styles.gridValue}>#IB-4492-B0</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Fecha límite</Text>
            <Text style={styles.gridValue}>29 de Mayo, 2025</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Ubicación</Text>
            <Text style={styles.gridValue}>Estante A · N1</Text>
          </View>
        </View>

        {/* Bloque de Acción Sugerida (FEFO) */}
        <View style={styles.actionSuggested}>
          <Text style={styles.actionTitle}>ACCIÓN SUGERIDA (ORDEN FEFO)</Text>
          <Text style={styles.actionBody}>
            Vender primero este lote antes del vencimiento o retirar del estante si está próximo a caducar.
          </Text>
        </View>
      </View>

      {/* Botones de Acción */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity 
          style={[styles.btnSell, isExpired && styles.btnDisabled]}
          disabled={isExpired}
          onPress={() => router.push('/venta')}
        >
          <Text style={[styles.btnSellText, isExpired && styles.btnDisabledText]}>
            {isExpired ? '✕ Venta Bloqueada (Vencido)' : '✓ Vender este lote'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnDiscard}
          onPress={() => router.push('/descartar')}
        >
          <Text style={styles.btnDiscardText}>Descartar de estante</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  content: { padding: Spacing.lg },
  backBtn: { width: 44, height: 44, justifyContent: 'center', marginBottom: Spacing.sm },
  title: { fontSize: Typography.scale.h1, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  subtitle: { fontSize: Typography.scale.body, color: Colors.textSecondary, marginTop: 2 },
  expiredBanner: {
    backgroundColor: Colors.critical.bg,
    borderColor: Colors.critical.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  expiredText: { color: Colors.critical.text, fontSize: 11.5, fontFamily: Typography.fontFamilyBold, flex: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, marginVertical: Spacing.md },
  medCategory: { fontSize: 11, fontFamily: Typography.fontFamilyBold, color: Colors.textSecondary, letterSpacing: 0.5 },
  medName: { fontSize: Typography.scale.h1, fontFamily: Typography.fontFamilyBold, color: Colors.text, marginTop: 2 },
  medDesc: { fontSize: Typography.scale.body, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 11, color: Colors.textSecondary },
  gridValue: { fontSize: 15, fontFamily: Typography.fontFamilyBold, color: Colors.text, marginTop: 2 },
  actionSuggested: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionTitle: { fontSize: 11, fontFamily: Typography.fontFamilyBold, color: Colors.primaryContainerText },
  actionBody: { fontSize: 12, color: Colors.primaryContainerText, marginTop: 2 },
  buttonsRow: { gap: Spacing.md, marginTop: Spacing.md },
  btnSell: { backgroundColor: Colors.primary, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnSellText: { color: '#FFFFFF', fontSize: Typography.scale.button, fontFamily: Typography.fontFamilyBold },
  btnDisabled: { backgroundColor: Colors.disabledBg },
  btnDisabledText: { color: Colors.textDisabled },
  btnDiscard: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnDiscardText: { color: Colors.textSecondary, fontSize: Typography.scale.button, fontFamily: Typography.fontFamilyMedium },
});
