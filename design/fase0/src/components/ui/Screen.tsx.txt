import React from 'react';
import { StyleSheet, View, ViewStyle, ScrollView, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  /** Envuelve el contenido en un ScrollView (por defecto sí). */
  scroll?: boolean;
  /** Quita el padding horizontal estándar para listas a sangre. */
  bleed?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  /** Reserva espacio inferior para la tab bar flotante. */
  bottomInset?: boolean;
  /** Barra superior fija (full-bleed) fuera del scroll. */
  header?: React.ReactNode;
};

/**
 * Contenedor base de TODAS las pantallas de Alivia.
 * Garantiza el mismo canvas, el mismo gutter y el mismo safe-area.
 */
export function Screen({
  children,
  scroll = true,
  bleed = false,
  style,
  contentContainerStyle,
  bottomInset = true,
  header,
}: Props) {
  const insets = useSafeAreaInsets();
  const paddingBottom = (bottomInset ? insets.bottom + 76 : insets.bottom) + Spacing.lg;
  const horizontal = bleed ? 0 : Spacing.gutter;
  const top = header ? Spacing.lg : insets.top + Spacing.lg;

  if (!scroll) {
    return (
      <View style={[styles.root, style]}>
        {header}
        <View style={{ flex: 1, paddingTop: header ? Spacing.lg : insets.top, paddingHorizontal: horizontal, paddingBottom }}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, style]}>
      {header}
      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          { paddingTop: top, paddingHorizontal: horizontal, paddingBottom },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvas },
});
