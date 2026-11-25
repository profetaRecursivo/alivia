import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { AlertCircle, Clock, Settings } from 'lucide-react-native';

// INTEGRANTE 1: Dashboard y métricas generales
export default function DashboardScreen() {
  const router = useRouter();
  const [stats] = useState({ expired: 3, critical: 12, monitored: 148 });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>Alivia</Text>
          <Text style={styles.pharmacyName}>Farmacia San Martín</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/configuracion')}
        >
          <Settings size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Saludo y Mostrador Activo */}
      <View style={styles.bannerActive}>
        <Text style={styles.bannerTag}>MOSTRADOR ACTIVO</Text>
        <Text style={styles.title}>Hola, esto necesita tu atención hoy</Text>
        <Text style={styles.subtitle}>Revisa los medicamentos antes de atender al siguiente cliente.</Text>
      </View>

      {/* Tarjeta 1: Vencidos (Crítico) */}
      <View style={[styles.card, { borderColor: Colors.critical.border }]}>
        <View style={[styles.badgeIcon, { backgroundColor: Colors.critical.bg }]}>
          <AlertCircle size={24} color={Colors.critical.text} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.metricNumber, { color: Colors.critical.text }]}>{stats.expired}</Text>
          <Text style={styles.metricLabel}>Vencidos</Text>
          <Text style={styles.metricDesc}>Retirar de estante hoy</Text>
        </View>
      </View>

      {/* Tarjeta 2: Próximos a Vencer (Atención) */}
      <View style={[styles.card, { borderColor: Colors.attention.border }]}>
        <View style={[styles.badgeIcon, { backgroundColor: Colors.attention.bg }]}>
          <Clock size={24} color={Colors.attention.text} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.metricNumber, { color: Colors.attention.text }]}>{stats.critical}</Text>
          <Text style={styles.metricLabel}>Próximos a vencer</Text>
          <Text style={styles.metricDesc}>Ofrecer primero al cliente (FEFO)</Text>
        </View>
      </View>

      {/* Botón Principal: Ver Alertas */}
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => router.push('/por-vencer')}
      >
        <Text style={styles.primaryButtonText}>Ver alertas →</Text>
        <Text style={styles.primaryButtonSub}>Presiona para abrir los 12 productos prioritarios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  content: { padding: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  appName: { fontSize: 18, fontFamily: Typography.fontFamilyBold, color: Colors.primary },
  pharmacyName: { fontSize: Typography.scale.metadata, color: Colors.textSecondary },
  settingsButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  bannerActive: { marginBottom: Spacing.xl },
  bannerTag: { fontSize: 11, fontFamily: Typography.fontFamilyBold, color: Colors.primary, letterSpacing: 0.5 },
  title: { fontSize: Typography.scale.h1, fontFamily: Typography.fontFamilyBold, color: Colors.text, marginTop: 4 },
  subtitle: { fontSize: Typography.scale.body, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badgeIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  cardContent: { flex: 1 },
  metricNumber: { fontSize: Typography.scale.display, fontFamily: Typography.fontFamilyBold },
  metricLabel: { fontSize: Typography.scale.h2, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  metricDesc: { fontSize: Typography.scale.metadata, color: Colors.textSecondary },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontFamily: Typography.fontFamilyBold },
  primaryButtonSub: { color: Colors.primaryContainer, fontSize: 12, marginTop: 2 },
});
