import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';

// INTEGRANTE 1: Pantalla de Configuración de Umbrales de Aviso (15, 30 y 60 días)
export default function ConfiguracionScreen() {
  const router = useRouter();
  const [notify60, setNotify60] = useState(true);
  const [notify30, setNotify30] = useState(true);
  const [notify15, setNotify15] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Botón Volver */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Configuración</Text>
      <Text style={styles.subtitle}>Avisos automáticos</Text>
      <Text style={styles.desc}>
        Elige con cuánto tiempo de anticipación quieres que Alivia te avise al celular para que no pierdas ningún producto.
      </Text>

      {/* Regla 60 días */}
      <View style={styles.ruleCard}>
        <View style={styles.ruleInfo}>
          <Text style={styles.ruleTitle}>Notificar 60 días antes (Regular)</Text>
          <Text style={styles.ruleDesc}>Aviso temprano para coordinar cambios o devoluciones con el distribuidor.</Text>
        </View>
        <Switch value={notify60} onValueChange={setNotify60} trackColor={{ true: Colors.primary }} />
      </View>

      {/* Regla 30 días */}
      <View style={styles.ruleCard}>
        <View style={styles.ruleInfo}>
          <Text style={styles.ruleTitle}>Notificar 30 días antes (Atención)</Text>
          <Text style={styles.ruleDesc}>Prioriza este producto al frente del mostrador para venta oportuna.</Text>
        </View>
        <Switch value={notify30} onValueChange={setNotify30} trackColor={{ true: Colors.primary }} />
      </View>

      {/* Regla 15 días */}
      <View style={styles.ruleCard}>
        <View style={styles.ruleInfo}>
          <Text style={styles.ruleTitle}>Notificar 15 días antes (Crítico)</Text>
          <Text style={styles.ruleDesc}>Alerta máxima para retirar o liquidar medicamentos de urgencia.</Text>
        </View>
        <Switch value={notify15} onValueChange={setNotify15} trackColor={{ true: Colors.primary }} />
      </View>

      {/* Toast de confirmación de guardado */}
      <View style={styles.toast}>
        <CheckCircle2 size={18} color="#FFFFFF" />
        <Text style={styles.toastText}>Preferencias de avisos actualizadas automáticamente</Text>
      </View>

      <Text style={styles.versionText}>Alivia v1.2 · Cochabamba, Bolivia.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  content: { padding: Spacing.lg },
  backBtn: { width: 44, height: 44, justifyContent: 'center', marginBottom: Spacing.sm },
  title: { fontSize: Typography.scale.h1, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  subtitle: { fontSize: Typography.scale.body, color: Colors.textSecondary, marginTop: 2 },
  desc: { fontSize: Typography.scale.metadata, color: Colors.textSecondary, marginVertical: Spacing.md, lineHeight: 18 },
  ruleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ruleInfo: { flex: 1, marginRight: Spacing.md },
  ruleTitle: { fontSize: Typography.scale.body, fontFamily: Typography.fontFamilyBold, color: Colors.text },
  ruleDesc: { fontSize: Typography.scale.metadata, color: Colors.textSecondary, marginTop: 4 },
  toast: {
    backgroundColor: Colors.success.text,
    borderRadius: 8,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  toastText: { color: '#FFFFFF', fontSize: 12, flex: 1 },
  versionText: { textAlign: 'center', color: Colors.textSecondary, fontSize: 12, marginTop: Spacing.xl },
});
