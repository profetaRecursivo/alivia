import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  /** Muestra la flecha de retroceso (convención de la app). */
  back?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
};

/**
 * Encabezado único de pantalla: título 22 PJS Bold, subtítulo 13,
 * flecha ← arriba a la izquierda (Ley de Jakob).
 */
export function ScreenHeader({ title, subtitle, back = false, onBack, right }: Props) {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        {back ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack ?? (() => router.back())}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: Spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  backBtn: {
    width: 44,
    height: 44,
    marginLeft: -Spacing.sm,
    marginRight: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: { flex: 1, justifyContent: 'center' },
  title: {
    fontSize: Typography.scale.h1,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: { marginLeft: Spacing.sm },
});
