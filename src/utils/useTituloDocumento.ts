import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { tituloEvento } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';

const APP = 'Reventa Verificada';

const ESTATICOS: Record<string, string> = {
  '/': 'Inicio',
  '/login': 'Ingresar',
  '/entradas': 'Mis entradas',
  '/vender': 'Vender',
  '/perfil': 'Perfil',
  '/ayuda': 'Ayuda y garantía',
  '/metodos-pago': 'Métodos de pago',
};

const DINAMICOS: [RegExp, string][] = [
  [/^\/oferta\//, 'Detalle de la entrada'],
  [/^\/verificacion\//, 'Verificación'],
  [/^\/pago\//, 'Pago con garantía'],
  [/^\/confirmacion\//, 'Entrada confirmada'],
  [/^\/entrada\//, 'Tu entrada'],
  [/^\/reporte\//, 'Reportar un problema'],
];

/** En web, el título de la pestaña del navegador sigue a la pantalla actual. */
export function useTituloDocumento() {
  const pathname = usePathname();
  const events = useAppStore((s) => s.events);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    let titulo = ESTATICOS[pathname];
    if (!titulo) {
      const evento = pathname.match(/^\/evento\/([^/]+)/);
      if (evento) {
        const e = events.find((ev) => ev.id === evento[1]);
        titulo = e ? tituloEvento(e) : 'Evento';
      } else {
        titulo = DINAMICOS.find(([re]) => re.test(pathname))?.[1] ?? 'Página no encontrada';
      }
    }
    document.title = `${titulo} · ${APP}`;
  }, [pathname, events]);
}
