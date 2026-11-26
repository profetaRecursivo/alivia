import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui';
import { Check, X } from 'lucide-react-native';

// INTEGRANTE 2: Listado de Vencimientos con pestañas 15d, 30d y 60d
export default function PorVencerScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'15' | '30' | '60'>('15');
  const [showUndo, setShowUndo] = useState(false);

  // Datos semilla de Figma
  const items = [
    { id: 'ib-449', name: 'Ibuprofeno 400 mg', lote: 'IB-449', desc: 'Comprimidos caja', stock: '5 unidades', days: 15, severity: 'critical' },
    { id: 'p-500', name: 'Paracetamol 500 mg', lote: 'P-500', desc: 'Jarabe infantil', stock: '3 frascos', days: 12, severity: 'critical' },
    { id: 'amx-12', name: 'Amoxicilina 250 mg', lote: 'AMX-12', desc: 'Suspensión 60ml', stock: '2 frascos', days: 8, severity: 'critical' },
  ];

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <ScreenHeader
          title="Por Vencer"
          subtitle="Revisa y marca según lo que vendas o descartes"
          back
        />
      </View>

      {/* Tabs Temporales */}
      <View style={styles.tabsContainer}>
        {(['15', '30', '60'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab} días
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Toast de Deshacer */}
      {showUndo && (
        <View style={styles.undoToast}>
          <Text style={styles.undoText}>Listo, quitado de la lista</Text>
          <TouchableOpacity onPress={() => setShowUndo(false)}>
            <Text style={styles.undoAction}>DESHACER</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de Medicamentos */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.historyLink}
            onPress={() => router.push('/historial')}
          >
            <Text style={styles.historyLinkText}>
              ↺ Ver historial completo de productos retirados
            </Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/detalle/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medDesc}>Lote {item.lote} · {item.desc}</Text>
              </View>
              <View style={[styles.daysBadge, { backgroundColor: Colors.critical.bg }]}>
                <Text style={[styles.daysText, { color: Colors.critical.text }]}>
                  Vence en {item.days} días
                </Text>
              </View>
            </View>

            <Text style={styles.stockText}>Cantidad: {item.stock}</Text>

            {/* Acciones de Tarjeta: Vender (Primario) vs Descartar (Outline) */}
            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={styles.btnSell}
                onPress={() => router.push(`/venta/${item.id}`)}
              >
                <Check size={16} color="#FFFFFF" />
                <Text style={styles.btnSellText}>Vender</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnDiscard}
                onPress={() => router.push(`/descartar/${item.id}`)}
              >
                <X size={16} color={Colors.textSecondary} />
                <Text style={styles.btnDiscardText}>Descartar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  title: { fontSize: Typography.scale.h1, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  subtitle: { fontSize: Typography.scale.body, color: Colors.textSecondary, marginTop: 2 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginVertical: Spacing.md, gap: Spacing.sm },
  tab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: 20, backgroundColor: '#E2E8F0' },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.scale.button, color: Colors.textSecondary, fontFamily: Typography.fontFamilyMedium },
  tabTextActive: { color: '#FFFFFF', fontFamily: Typography.fontFamilyBold },
  list: { padding: Spacing.lg, gap: Spacing.md },
  card: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  medName: { fontSize: Typography.scale.h2, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  medDesc: { fontSize: Typography.scale.metadata, color: Colors.textSecondary, marginTop: 2 },
  daysBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 6 },
  daysText: { fontSize: 10.5, fontFamily: Typography.fontFamilyBold },
  stockText: { fontSize: 13, color: Colors.textSecondary, marginVertical: Spacing.sm },
  actionsRow: { flexDirection: 'row', gap: 24, marginTop: Spacing.sm },
  btnSell: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnSellText: { color: '#FFFFFF', fontSize: Typography.scale.button, fontFamily: Typography.fontFamilyBold },
  btnDiscard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnDiscardText: { color: Colors.textSecondary, fontSize: Typography.scale.button, fontFamily: Typography.fontFamilyMedium },
  undoToast: {
    backgroundColor: '#1E293B',
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  undoText: { color: '#FFFFFF', fontSize: 13 },
  undoAction: { color: '#38BDF8', fontSize: 13, fontFamily: Typography.fontFamilyBold },
  historyLink: { alignItems: 'center', paddingVertical: Spacing.lg },
  historyLinkText: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
    color: Colors.primary,
  },
});
