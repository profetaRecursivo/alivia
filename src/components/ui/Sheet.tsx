import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import {
  PanGestureHandler,
  State,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
  /** Habilita el gesto de arrastrar hacia abajo para cerrar. */
  onRequestClose?: () => void;
};

/**
 * Cuerpo estándar de BottomSheet. El scrim y la presentación modal
 * los aporta el navegador (Stack `presentation: 'modal'` o 'transparentModal').
 * Título de sheet SIEMPRE 20 px PJS Bold.
 *
 * Entra deslizándose y se puede arrastrar hacia abajo desde el header.
 * El gesto usa PanGestureHandler para que la hoja siga el dedo.
 */
export function Sheet({
  title,
  subtitle,
  children,
  footer,
  style,
  onRequestClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(800));
  const [opacity] = useState(() => new Animated.Value(1));
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        if (mounted) setReduceMotion(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion === null) return;

    if (reduceMotion) {
      translateY.setValue(0);
      opacity.setValue(0);
      const fade = Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      });
      fade.start();
      return () => fade.stop();
    }

    opacity.setValue(1);
    const animation = Animated.timing(translateY, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion, translateY]);

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const next = Math.max(0, event.nativeEvent.translationY);
    translateY.setValue(next);
  };

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState !== State.ACTIVE) return;

    const { translationY: drag, velocityY } = event.nativeEvent;
    const shouldClose =
      Boolean(onRequestClose) && (drag > 90 || velocityY > 600);

    if (shouldClose) {
      Animated.timing(translateY, {
        toValue: 800,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) onRequestClose?.();
      });
      return;
    }

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: false,
      bounciness: 0,
      speed: 18,
    }).start();
  };

  const header = (
    <View>
      <View style={styles.grabber} />
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {onRequestClose ? (
          <TouchableOpacity
            style={styles.close}
            onPress={onRequestClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <X size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <Animated.View
      accessibilityViewIsModal
      style={[
        styles.root,
        { paddingBottom: Spacing.xxl + insets.bottom },
        style,
        { transform: [{ translateY }], opacity },
      ]}
    >
      {onRequestClose ? (
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetY={6}
          failOffsetX={[-24, 24]}
        >
          {header}
        </PanGestureHandler>
      ) : (
        header
      )}
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingHorizontal: Spacing.gutter,
    ...Shadows.sheet,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.borderStrong,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  headerText: { flex: 1 },
  close: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.scale.modalTitle,
    fontFamily: Typography.fontFamilyBold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  body: { gap: Spacing.md },
  footer: { marginTop: Spacing.lg, gap: Spacing.sm },
});
