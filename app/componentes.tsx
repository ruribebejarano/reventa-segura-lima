// TEMPORAL: galería para revisar los componentes. Borrar cuando existan las pantallas reales.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {
  AppHeader,
  AppText,
  Badge,
  Button,
  Card,
  CheckItem,
  InfoBox,
  PriceRow,
  Screen,
} from '@/components';
import { StoreDebug } from '@/components/StoreDebug';
import { colors, spacing } from '@/theme';
import { formatSoles } from '@/utils/format';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="caption" weight="semibold" color={colors.textSecondary} style={styles.sectionTitle}>
        {title.toUpperCase()}
      </AppText>
      {children}
    </View>
  );
}

export default function Componentes() {
  const [loading, setLoading] = useState(false);

  const simularPago = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <Screen
      scroll
      header={<AppHeader title="Componentes (temporal)" />}
      footer={<Button title="Pagar S/ 242 de forma segura" icon="lock-closed" onPress={simularPago} loading={loading} />}>
      <Section title="Store (debug)">
        <StoreDebug />
      </Section>

      <Section title="AppHeader · variante marca">
        <View style={styles.headerPreview}>
          <AppHeader />
        </View>
      </Section>

      <Section title="Tipografía">
        <AppText variant="title">Title 24 / 700</AppText>
        <AppText variant="h2">H2 20 / 700</AppText>
        <AppText variant="body">Body 16 / 400 — Compra sin miedo a la estafa.</AppText>
        <AppText variant="small" color={colors.textSecondary}>
          Small 14 — Verificamos tu entrada con la ticketera oficial.
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Caption 12 — Simulado: no se realizan pagos reales.
        </AppText>
      </Section>

      <Section title="Botones">
        <Button title="Comprar entrada" onPress={() => {}} />
        <Button title="Ver detalles" variant="secondary" onPress={() => {}} />
        <Button title="Ahora no" variant="ghost" onPress={() => {}} />
        <Button title="Deshabilitado" disabled />
        <Button title="Cargando" loading />
      </Section>

      <Section title="Badges">
        <View style={styles.wrap}>
          <Badge variant="agotado" />
          <Badge variant="verificado" />
          <Badge variant="retenido" />
          <Badge variant="liberado" />
          <Badge variant="reembolsado" />
          <Badge variant="error" label="No se pudo verificar" />
        </View>
      </Section>

      <Section title="Card + PriceRow + CheckItem">
        <Card style={styles.gap}>
          <View style={styles.cardTop}>
            <View style={styles.flex}>
              <AppText variant="h2">Concierto en el Estadio Nacional</AppText>
              <AppText variant="small" color={colors.textSecondary}>
                Sáb 14 dic · Campo A · Lima
              </AppText>
            </View>
            <Badge variant="verificado" />
          </View>
          <View style={styles.divider} />
          <PriceRow label="Precio de la entrada" amount={220} />
          <PriceRow label="Comisión de servicio" amount={22} />
          <View style={styles.divider} />
          <PriceRow label="Total" amount={242} total />
        </Card>

        <Card>
          <CheckItem text="Verificada con la ticketera oficial" />
          <CheckItem text="Reemitida a tu nombre y DNI con un QR nuevo" />
          <CheckItem text="Tu pago queda retenido hasta que ingreses al evento" />
        </Card>
      </Section>

      <Section title="InfoBox">
        <InfoBox icon="shield-checkmark" title="Tu dinero está protegido">
          Si no puedes entrar al concierto, {'te devolvemos el 100 %.'}
        </InfoBox>
        <InfoBox variant="info" icon="information-circle">
          La ticketera anulará el QR anterior y generará uno nuevo a tu nombre.
        </InfoBox>
      </Section>

      <Section title="QR (react-native-qrcode-svg)">
        <Card style={styles.qrCard}>
          <QRCode value="RV-DEMO-0001|DNI 12345678" size={160} color={colors.navyDeep} />
          <AppText variant="caption" color={colors.textSecondary}>
            QR de prueba
          </AppText>
        </Card>
      </Section>

      <Section title="formatSoles">
        <AppText variant="small">
          {[220, 1250, 89.9, 0].map(formatSoles).join('  ·  ')}
        </AppText>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md, marginBottom: spacing.xl },
  sectionTitle: { letterSpacing: 0.6 },
  headerPreview: { borderRadius: 12, overflow: 'hidden' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gap: { gap: spacing.xs },
  cardTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginBottom: spacing.sm },
  flex: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  qrCard: { alignItems: 'center', gap: spacing.sm },
});
