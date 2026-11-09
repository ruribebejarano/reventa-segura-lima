import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppHeader, AppText, Card, InfoBox, ListRow, Screen } from '@/components';
import { colors, spacing } from '@/theme';

export default function MetodosPago() {
  return (
    <Screen header={<AppHeader title="Métodos de pago" onBack={() => router.back()} />} contentStyle={styles.content}>
      <Card style={styles.lista}>
        <ListRow label="Tarjeta •••• 4242" icon="card-outline" />
        <ListRow label="Yape" icon="phone-portrait-outline" separada />
      </Card>
      <InfoBox variant="info" icon="information-circle">
        Son métodos de demostración: no se realiza ningún cobro.
      </InfoBox>
      <AppText variant="caption" color={colors.textSecondary}>
        Eliges el método al pagar cada entrada.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  lista: { padding: 0, overflow: 'hidden' },
});
