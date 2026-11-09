import { useSyncExternalStore } from 'react';

import { useAppStore } from './useAppStore';

const suscribir = (aviso: () => void) => useAppStore.persist.onFinishHydration(aviso);
const hidratado = () => useAppStore.persist.hasHydrated();

/** true cuando el store ya leyó lo guardado en AsyncStorage (evita redirigir a /login antes de tiempo). */
export function useHydrated(): boolean {
  return useSyncExternalStore(suscribir, hidratado, hidratado);
}
