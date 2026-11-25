import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, Syringe } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { APP } from '@/lib/demo-data';

type Props = {
  /** Muestra la flecha de retroceso (Ley de Jakob). */
  back?: boolean;
  onBack?: () => void;
  /** Reemplaza el botón de ajustes de la derecha. */
  right?: React.ReactNode;
};

/**
 * Barra superior única de la app: marca + farmacia + ajustes.
 * Va fuera del scroll y aplica el safe-area superior.
 */
export function AppHeader({ back = false, onBack, right }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {back ? (
          <Pressable
            style={styles.iconButton}
            onPress={onBack ?? (() => router.back())}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <ArrowLeft size={22} color={Colors.text} />
          </Pressable>
        ) : null}

        <View style={styles.brand} accessibilityRole="header">
          <View style={styles.logo}>
            <Syringe size={20} color={Colors.white} />
          </View>
          <View style={styles.brandText}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {APP.name}
              </Text>
              <View style={styles.dot} />
            </View>
            <Text style={styles.pharmacy} numberOfLines={1}>
              {APP.pharmacy}
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {right ?? (
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push('/configuracion')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Ajustes"
          >
            <Settings size={20} color={Colors.text} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    minHeight: 69,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.canvasAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { flexShrink: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  name: {
    fontSize: Typography.scale.brand,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success.accent,
  },
  pharmacy: {
    fontSize: Typography.scale.label,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  spacer: { flex: 1 },
});
