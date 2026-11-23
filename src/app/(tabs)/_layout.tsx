import React from 'react';
import { Tabs } from 'expo-router';
import { AlertTriangle, Calendar, Package, History } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const theme = Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Vencimientos',
          tabBarIcon: ({ color, size }) => <AlertTriangle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="por-vencer"
        options={{
          title: 'Por Vencer',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
