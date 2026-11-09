import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Screen, SegmentedTabs, TextField } from '@/components';
import type { User } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

type Modo = 'ingresar' | 'crear';

const ESPERA_MS = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validar = {
  nombre: (v: string) => (v.trim().length >= 2 ? undefined : 'Ingresa tu nombre'),
  email: (v: string) => (EMAIL_RE.test(v.trim()) ? undefined : 'Ingresa un correo válido'),
  dni: (v: string) => (/^\d{8}$/.test(v) ? undefined : 'Ingresa un DNI de 8 dígitos'),
  passwordNueva: (v: string) => (v.length >= 6 ? undefined : 'Usa al menos 6 caracteres'),
  password: (v: string) => (v.length > 0 ? undefined : 'Ingresa tu contraseña'),
};

type Campo = 'nombre' | 'email' | 'dni' | 'password';

export default function Login() {
  const login = useAppStore((s) => s.login);
  const loginDemo = useAppStore((s) => s.loginDemo);
  const registrarCuenta = useAppStore((s) => s.registrarCuenta);
  const buscarCuenta = useAppStore((s) => s.buscarCuenta);

  const [modo, setModo] = useState<Modo>('ingresar');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  // La contraseña solo vive en este estado local: nunca se guarda.
  const [password, setPassword] = useState('');
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const crear = modo === 'crear';
  const errores: Partial<Record<Campo, string>> = {
    email: validar.email(email),
    password: crear ? validar.passwordNueva(password) : validar.password(password),
    ...(crear && { nombre: validar.nombre(nombre), dni: validar.dni(dni) }),
  };
  const valido = Object.values(errores).every((e) => !e);
  const errorDe = (c: Campo) => (tocados[c] ? errores[c] : undefined);
  const tocar = (c: Campo) => () => setTocados((t) => ({ ...t, [c]: true }));

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setTocados({});
    setErrorGeneral(undefined);
  };

  const entrar = (user: User) => {
    login(user);
    // La ruta protegida lleva sola a las pestañas cuando aparece la sesión.
  };

  const enviar = () => {
    if (!valido || enviando) return;
    setErrorGeneral(undefined);
    setEnviando(true);

    timer.current = setTimeout(() => {
      setEnviando(false);
      const correo = email.trim().toLowerCase();

      if (crear) {
        if (buscarCuenta(correo)) {
          setErrorGeneral('Ya existe una cuenta con ese correo. Ingresa con él.');
          return;
        }
        const user: User = {
          id: `u-${Date.now().toString(36)}`,
          nombre: nombre.trim().replace(/\s+/g, ' '),
          dni,
          dniMasked: `••••${dni.slice(-4)}`,
          email: correo,
          dniVerificado: true,
        };
        registrarCuenta(user);
        entrar(user);
        return;
      }

      const cuenta = buscarCuenta(correo);
      if (!cuenta) {
        setErrorGeneral('No encontramos una cuenta con ese correo. Crea una o entra como Ana.');
        return;
      }
      entrar(cuenta);
    }, ESPERA_MS);
  };

  const entrarDemo = () => {
    loginDemo();
    // La ruta protegida lleva sola a las pestañas cuando aparece la sesión.
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.brand}>
        <AppText weight="bold" color={colors.primary} align="center" style={styles.logo}>
          ✓ Reventa Verificada
        </AppText>
        <AppText color={colors.textSecondary} align="center">
          Compra y vende entradas con garantía
        </AppText>
      </View>

      <SegmentedTabs
        value={modo}
        onChange={cambiarModo}
        options={[
          { key: 'ingresar', label: 'Ingresar' },
          { key: 'crear', label: 'Crear cuenta' },
        ]}
      />

      <View style={styles.form}>
        {crear ? (
          <TextField
            label="Nombre y apellido"
            placeholder="Ej. Ana Torres"
            value={nombre}
            onChangeText={setNombre}
            onBlur={tocar('nombre')}
            error={errorDe('nombre')}
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            returnKeyType="next"
          />
        ) : null}

        <TextField
          label="Correo"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChangeText={setEmail}
          onBlur={tocar('email')}
          error={errorDe('email')}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        {crear ? (
          <TextField
            label="DNI"
            placeholder="8 dígitos"
            value={dni}
            onChangeText={(v) => setDni(v.replace(/\D/g, '').slice(0, 8))}
            onBlur={tocar('dni')}
            error={errorDe('dni')}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={8}
            returnKeyType="next"
          />
        ) : null}

        <TextField
          label="Contraseña"
          placeholder={crear ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
          password
          value={password}
          onChangeText={setPassword}
          onBlur={tocar('password')}
          error={errorDe('password')}
          autoComplete={crear ? 'new-password' : 'current-password'}
          textContentType={crear ? 'newPassword' : 'password'}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={enviar}
        />

        {errorGeneral ? (
          <AppText variant="small" color={colors.danger} accessibilityLiveRegion="polite">
            {errorGeneral}
          </AppText>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          title={crear ? 'Crear cuenta' : 'Ingresar'}
          onPress={enviar}
          disabled={!valido}
          loading={enviando}
        />
        <Button title="Entrar como Ana (demo)" variant="secondary" onPress={entrarDemo} disabled={enviando} />
      </View>

      <AppText variant="caption" color={colors.textSecondary} align="center">
        Tu DNI se usa para emitir las entradas a tu nombre.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  brand: { gap: spacing.sm },
  logo: { fontSize: 28, lineHeight: 34 },
  form: { gap: spacing.lg },
  actions: { gap: spacing.md },
});
