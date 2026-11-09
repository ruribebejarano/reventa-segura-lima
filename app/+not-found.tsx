import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader, AppText, Button, Screen } from '@/components';
import { colors, radius, spacing } from '@/theme';

/** Reemplaza la pantalla "Unmatched Route" (en inglés) de Expo Router. */
export default function NoEncontrada() {
  return (
    <Screen
      header={<AppHeader />}
      contentStyle={styles.content}
      footer={<Button title="Ir al inicio" onPress={() => router.replace('/' as Href)} />}>
      <View style={styles.icono}>
        <Ionicons name="compass-outline" size={36} color={colors.primary} />
      </View>
      <AppText variant="title" align="center">
        No encontramos esta página
      </AppText>
      <AppText color={colors.textSecondary} align="center">
        Puede que el enlace esté incompleto o que la página ya no exista.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  icono: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
