// TEMPORAL: perfil provisional con cerrar sesión para poder probar el login.
import { AppHeader, AppText, Button, Card, Screen } from '@/components';
import { EnConstruccion } from '@/components/EnConstruccion';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

export default function Perfil() {
  const user = useAppStore((s) => s.user);
  const modoPrueba = useAppStore((s) => s.modoPrueba);
  const logout = useAppStore((s) => s.logout);
  const setModoPrueba = useAppStore((s) => s.setModoPrueba);

  return (
    <Screen header={<AppHeader />} bottomInset={false}>
      <EnConstruccion titulo="Perfil">
        <Card>
          <AppText weight="semibold">{user?.nombre}</AppText>
          <AppText variant="small" color={colors.textSecondary}>
            {user?.email} · DNI {user?.dniMasked}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Modo prueba: {modoPrueba ? 'activo' : 'inactivo'}
          </AppText>
        </Card>
        {modoPrueba ? (
          <Button title="Salir del modo prueba" variant="ghost" onPress={() => setModoPrueba(false)} />
        ) : null}
        <Button title="Cerrar sesión" variant="secondary" onPress={logout} />
      </EnConstruccion>
    </Screen>
  );
}
