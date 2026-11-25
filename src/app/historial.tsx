import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui';
import { ArrowDownRight, ArrowUpRight, AlertTriangle } from 'lucide-react-native';

// INTEGRANTE 6: Historial de Movimientos y Auditoría
export default function HistorialScreen() {
  const movements = [
    { id: '1', med: 'Amoxicilina 500 mg', lote: 'AMX-08', type: 'ENTRY', qty: '+12 frascos', date: 'Hoy, 10:30', user: 'Doña Elena' },
    { id: '2', med: 'Amoxicilina + Ác. Clavulánico', lote: 'AMX-14', type: 'SALE', qty: '-5 comprimidos', date: 'Ayer, 18:45', user: 'Doña Elena' },
    { id: '3', med: 'Ibuprofeno 400 mg', lote: 'IB-449', type: 'DISCARD', qty: '-2 comprimidos', date: '15 Nov', user: 'Doña Elena', reason: 'Vencido' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScreenHeader
          title="Historial"
          subtitle="Registro de movimientos de inventario"
          back
        />
      </View>

      <FlatList
        data={movements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[
              styles.iconBox,
              item.type === 'SALE' && { backgroundColor: Colors.success.bg },
              item.type === 'ENTRY' && { backgroundColor: Colors.primaryContainer },
              item.type === 'DISCARD' && { backgroundColor: Colors.critical.bg },
            ]}>
              {item.type === 'SALE' && <ArrowDownRight size={20} color={Colors.success.text} />}
              {item.type === 'ENTRY' && <ArrowUpRight size={20} color={Colors.primary} />}
              {item.type === 'DISCARD' && <AlertTriangle size={20} color={Colors.critical.text} />}
            </View>

            <View style={styles.info}>
              <Text style={styles.medName}>{item.med}</Text>
              <Text style={styles.meta}>Lote {item.lote} · {item.date}</Text>
            </View>

            <Text style={[
              styles.qty,
              item.type === 'SALE' && { color: Colors.text },
              item.type === 'ENTRY' && { color: Colors.primary },
              item.type === 'DISCARD' && { color: Colors.critical.text },
            ]}>
              {item.qty}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  header: { padding: Spacing.lg },
  title: { fontSize: Typography.scale.h1, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  subtitle: { fontSize: Typography.scale.body, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  medName: { fontSize: Typography.scale.body, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  meta: { fontSize: Typography.scale.metadata, color: Colors.textSecondary, marginTop: 2 },
  qty: { fontSize: Typography.scale.button, fontFamily: Typography.fontFamilyBold },
});
