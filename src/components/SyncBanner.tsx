import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, CloudOff, RefreshCw } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { startSyncWatcher, useSync } from '@/lib/sync';

/**
 * Aviso global de sincronización. No tiene botones, no bloquea y no se cierra
 * a mano. Se monta en el prop `header` de `Screen`, junto a `AppHeader`.
 *
 * - offline: "Sin conexión" + cambios guardados.
 * - syncing: "Sincronizando cambios…" + progreso real.
 * - done: pill verde "Todo sincronizado" durante 2.5 s.
 */
export function SyncBanner() {
  const { phase, pending, progress } = useSync();
  const insets = useSafeAreaInsets();
  const [spin] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);
  const previousPhase = useRef(phase);

  useEffect(() => startSyncWatcher(), []);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        // Si el sistema no responde, se deja la animación activa.
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'syncing' || reduceMotion) {
      spin.stopAnimation();
      spin.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [phase, reduceMotion, spin]);

  useEffect(() => {
    if (phase === 'done' && previousPhase.current !== 'done') {
      AccessibilityInfo.announceForAccessibility('Todo sincronizado');
    }
    previousPhase.current = phase;
  }, [phase]);

  if (phase === 'idle') return null;

  if (phase === 'done') {
    return (
      <View
        pointerEvents="none"
        style={[styles.doneWrap, { bottom: insets.bottom + 76 }]}
      >
        <View
          style={styles.donePill}
          accessible
          accessibilityLabel="Todo sincronizado"
          accessibilityLiveRegion="polite"
        >
          <Check size={14} color={Colors.success.text} />
          <Text style={styles.doneText}>Todo sincronizado</Text>
        </View>
      </View>
    );
  }

  if (pending <= 0) return null;

  const isOffline = phase === 'offline';
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const body = isOffline
    ? pending === 1
      ? '1 cambio guardado. Se sincronizará automáticamente cuando vuelva la conexión.'
      : `${pending} cambios guardados. Se sincronizarán automáticamente cuando vuelva la conexión.`
    : 'La conexión volvió, espere mientras se sincronizan los cambios.';

  return (
    <View
      style={styles.banner}
      accessible
      accessibilityRole="status"
      accessibilityLiveRegion="polite"
      accessibilityLabel={
        isOffline ? `Sin conexión. ${body}` : `Sincronizando cambios. ${body}`
      }
    >
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          {isOffline ? (
            <CloudOff size={16} color={Colors.info.text} />
          ) : (
            <Animated.View style={{ transform: [{ rotate }] }}>
              <RefreshCw size={16} color={Colors.info.text} />
            </Animated.View>
          )}
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>
            {isOffline ? 'Sin conexión' : 'Sincronizando cambios…'}
          </Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </View>

      {isOffline ? null : (
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(Math.max(6, Math.min(progress * 100, 100))),
          }}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(6, Math.min(progress * 100, 100))}%` },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.three,
    minHeight: 64,
    backgroundColor: Colors.info.bg,
    borderWidth: 1,
    borderColor: Colors.info.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.info.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: Typography.scale.body,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.info.text,
  },
  body: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilyRegular,
    color: Colors.info.text,
    lineHeight: 16,
  },
  progressTrack: {
    height: 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.info.border,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.info.text,
  },
  doneWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  donePill: {
    minWidth: 152,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success.bg,
    borderWidth: 1,
    borderColor: Colors.success.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  doneText: {
    fontSize: Typography.scale.metadata,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.success.text,
  },
});
