import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Undo2 } from 'lucide-react-native';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';

type Props = {
  message: string;
  actionLabel?: string;
  onAction: () => void;
};

/**
 * Snackbar flotante con DESHACER (Heurística de arrepentimiento).
 * Debe vivir sobre la tab bar, 5 s de duración (ver useUndoSnackbar).
 */
export function UndoSnackbar({ message, actionLabel = 'DESHACER', onAction }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity style={styles.action} onPress={onAction} hitSlop={8}>
        <Undo2 size={15} color={Colors.regular.border} />
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: Spacing.gutter,
    right: Spacing.gutter,
    bottom: Spacing.lg,
    backgroundColor: Colors.text,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    ...Shadows.modal,
  },
  message: {
    flex: 1,
    color: Colors.white,
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyMedium,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  actionText: {
    color: Colors.regular.border,
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyBold,
    letterSpacing: 0.4,
  },
});
