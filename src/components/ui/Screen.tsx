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
}: Props) {
  const insets = useSafeAreaInsets();
  const paddingBottom = (bottomInset ? insets.bottom + 76 : insets.bottom) + Spacing.lg;
  const horizontal = bleed ? 0 : Spacing.gutter;

  if (!scroll) {
    return (
      <View
        style={[
          styles.root,
          { paddingTop: insets.top, paddingHorizontal: horizontal, paddingBottom },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, style]}
      contentContainerStyle={[
        { paddingTop: insets.top + Spacing.lg, paddingHorizontal: horizontal, paddingBottom },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvas },
});
