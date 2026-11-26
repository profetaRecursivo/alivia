import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react-native';

// INTEGRANTE 5: Catálogo y Búsqueda de Stock con orden FEFO
export default function StockScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const stockItems = [
    { id: 'amx-08', name: 'Amoxicilina 500 mg', desc: 'Suspensión oral 60ml · Lab. IFA', stock: '12 frascos · Estante C · N2', price: 'Bs. 14.50', days: 18, lote: 'AMX-08' },
    { id: 'amx-14', name: 'Amoxicilina + Ác. Clavulánico', desc: 'Comprimidos 875/125 mg · Lab. Bagó', stock: '60 comprimidos · Estante C · N1', price: 'Bs. 4.00', days: 92, lote: 'AMX-14' },
    { id: 'amx-22', name: 'Amoxicilina 250 mg / 5ml', desc: 'Jarabe pediátrico 100ml · Lab. IFA', stock: '8 frascos · Estante B · N3', price: 'Bs. 18.00', days: 140, lote: 'AMX-22' },
  ];

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por fármaco o lote..."
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <SlidersHorizontal size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Orden FEFO indicador */}
      <View style={styles.infoRow}>
        <Text style={styles.countText}>{stockItems.length} lotes encontrados</Text>
        <Text style={styles.fefoBadge}>ORDEN FEFO ACTIVO</Text>
      </View>

      {/* Listado de Lotes */}
      <FlatList
        data={stockItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/detalle/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.price}>{item.price}</Text>
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.stockInfo}>{item.stock}</Text>
              <View style={styles.detailLink}>
                <Text style={styles.detailText}>Ver detalle</Text>
                <ChevronRight size={14} color={Colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  searchContainer: { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.sm },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: Typography.scale.body, color: Colors.text },
  filterBtn: { width: 44, height: 44, backgroundColor: Colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  countText: { fontSize: Typography.scale.metadata, color: Colors.textSecondary },
  fefoBadge: { fontSize: 10.5, fontFamily: Typography.fontFamilyBold, color: Colors.primary },
  list: { padding: Spacing.lg, gap: Spacing.md },
  card: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  medName: { fontSize: Typography.scale.h2, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  medDesc: { fontSize: Typography.scale.metadata, color: Colors.textSecondary, marginTop: 2 },
  price: { fontSize: 16, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  stockInfo: { fontSize: Typography.scale.metadata, color: Colors.textSecondary },
  detailLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailText: { fontSize: Typography.scale.metadata, fontFamily: Typography.fontFamilyBold, color: Colors.primary },
});
