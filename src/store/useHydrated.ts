import { useEffect, useState } from 'react';

import { useAppStore } from './useAppStore';

/** true cuando el store ya leyó lo guardado en AsyncStorage (evita redirigir a /login antes de tiempo). */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAppStore.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}
