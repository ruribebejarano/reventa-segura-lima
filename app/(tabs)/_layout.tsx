import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function icono(name: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color as string} />;
  }
  TabIcon.displayName = `TabIcon(${name})`;
  return TabIcon;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // En Android la barra subía sobre el teclado y tapaba el formulario de Vender.
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
        // Alto propio: con el alto por defecto (49) Inter 12 queda recortada debajo del ícono.
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarAccessibilityLabel: 'Inicio', tabBarIcon: icono('home-outline') }} />
      <Tabs.Screen name="entradas" options={{ title: 'Mis entradas', tabBarAccessibilityLabel: 'Mis entradas', tabBarIcon: icono('ticket-outline') }} />
      <Tabs.Screen name="vender" options={{ title: 'Vender', tabBarAccessibilityLabel: 'Vender', tabBarIcon: icono('pricetag-outline') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarAccessibilityLabel: 'Perfil', tabBarIcon: icono('person-outline') }} />
    </Tabs>
  );
}
