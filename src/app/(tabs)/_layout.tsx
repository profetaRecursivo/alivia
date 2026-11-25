import React from 'react';
import { Tabs } from 'expo-router';
import { AlertTriangle, Package } from 'lucide-react-native';
import { Colors, Typography } from '@/constants/theme';

/**
 * Navegación oficial de Alivia (Figma + Ley de Jakob):
 * SOLO 2 pestañas → Vencimientos y Stock.
 * Historial, Por Vencer, Detalle, Venta y Descarte son pantallas apiladas.
 */
export default function TabLayout() {
  const theme = Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fontFamilySemiBold,
          fontSize: Typography.scale.label,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Vencimientos',
          tabBarIcon: ({ color, size }) => <AlertTriangle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
