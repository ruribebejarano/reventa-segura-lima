import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import * as Linking from 'expo-linking';
import { Stack, router, useGlobalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PhoneFrame } from '@/components';
import { useAppStore } from '@/store/useAppStore';
import { useHydrated } from '@/store/useHydrated';
import { useTituloDocumento } from '@/utils/useTituloDocumento';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

function urlTienePrueba(url: string | null): boolean {
  if (!url) return false;
  try {
    return Linking.parse(url).queryParams?.prueba === '1';
  } catch {
    return false;
  }
}

/**
 * Enlace de prueba con usuarios: cualquier URL con ?prueba=1 activa el modo prueba,
 * entra como Ana y abre directamente /evento/e1.
 * Leemos también la URL inicial porque la redirección a /login puede perder el parámetro.
 */
function useEnlaceDePrueba(listo: boolean) {
  const { prueba } = useGlobalSearchParams<{ prueba?: string }>();
  const urlInicialConPrueba = useRef(urlTienePrueba(Linking.getLinkingURL()));
  const user = useAppStore((s) => s.user);
  // Ref (no estado): solo marca que falta navegar; no necesita volver a renderizar.
  const pendiente = useRef(false);

  useEffect(() => {
    if (!listo) return;
    if (urlInicialConPrueba.current || prueba === '1') {
      urlInicialConPrueba.current = false;
      const { resetDemo, setModoPrueba, loginDemo } = useAppStore.getState();
      // Cada enlace de prueba es un participante nuevo: datos y resultados limpios.
      resetDemo();
      setModoPrueba(true);
      pendiente.current = true;
      loginDemo();
    }
  }, [listo, prueba]);

  // Navegamos cuando la sesión ya existe; antes, la ruta protegida rechazaría la navegación.
  // loginDemo() crea un objeto de usuario nuevo, así que este efecto siempre vuelve a correr.
  useEffect(() => {
    if (pendiente.current && user) {
      pendiente.current = false;
      router.replace({ pathname: '/evento/[id]', params: { id: 'e1' } });
    }
  }, [user]);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const hydrated = useHydrated();
  const user = useAppStore((s) => s.user);

  // Sin Inter seguimos con la fuente del sistema; sin hidratar no sabemos si hay sesión.
  const listo = (fontsLoaded || !!fontError) && hydrated;

  useEnlaceDePrueba(listo);
  useTituloDocumento();

  useEffect(() => {
    if (listo) SplashScreen.hideAsync();
  }, [listo]);

  if (!listo) return null;

  const conSesion = user !== null;

  return (
    <SafeAreaProvider>
      <PhoneFrame>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}>
          {/* Sin sesión, cualquier ruta de este bloque redirige a /login. */}
          <Stack.Protected guard={conSesion}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="evento/[id]" />
            <Stack.Screen name="oferta/[id]" />
            <Stack.Screen name="verificacion/[id]" />
            <Stack.Screen name="pago/[id]" />
            <Stack.Screen name="confirmacion/[orderId]" options={{ gestureEnabled: false }} />
            <Stack.Screen name="entrada/[orderId]" />
            <Stack.Screen name="reporte/[orderId]" />
            <Stack.Screen name="ayuda" />
            <Stack.Screen name="metodos-pago" />
          </Stack.Protected>
          <Stack.Protected guard={!conSesion}>
            <Stack.Screen name="login" />
          </Stack.Protected>
        </Stack>
      </PhoneFrame>
    </SafeAreaProvider>
  );
}
