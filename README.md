# Reventa Verificada

Prototipo (MVP) de una app de **reventa segura de entradas para conciertos en Lima**.

- Verifica cada entrada con la ticketera oficial **antes de pagar**.
- La reemite **a nombre y DNI del comprador** con un QR nuevo (el QR del vendedor se anula).
- **Retiene el pago** hasta que el fan ingresa al evento. Si no entra, se le devuelve el 100 %.
- El precio de reventa nunca supera el **tope de 1,5 × el precio original**.

> Es un prototipo para demo y pruebas con usuarios: **todo es simulado**, sin backend ni pagos reales.

## Stack

Expo (SDK 58) · Expo Router · TypeScript · Zustand + AsyncStorage · react-native-qrcode-svg · Inter

## Cómo ejecutarlo

```bash
npm install
npx expo start          # escanea el QR con Expo Go (Android)
npx expo start --web    # versión web, enmarcada como celular
```

Usuario demo: botón **"Entrar como Ana (demo)"** en el login.

### Modo prueba (pruebas con usuarios)

Abre la app con `?prueba=1` (por ejemplo `http://localhost:8081/?prueba=1`). Activa el modo prueba, entra como Ana y abre directamente el primer evento. En este modo se registran las vistas y acciones y se pregunta la confianza del usuario (1 a 5) antes y después de la verificación.

En **Perfil → Sesión de prueba** está el resumen automático (¿tocó "Verificar" antes de pagar?, ¿pagó?, confianza antes → después, tiempo total y por pantalla). **Copiar resultados** lo copia como texto plano para pegarlo en el Experiment Board y **Nueva sesión** reinicia los datos para el siguiente participante.

Casos de demo:

- La oferta de **Sofía L. (Campo A, S/ 180)** de la Gira Aurora 2026 falla la verificación.
- Al vender, un código que empiece con **`USED`** falla la verificación.

## Estructura

```
app/              rutas (Expo Router)
  (tabs)/         Inicio, Mis entradas, Vender, Perfil
  evento/[id]     ofertas de un evento con tope de precio
  oferta/[id]     detalle de la oferta
  verificacion/   verificación simulada con la ticketera
  pago/           pago con garantía (ficticio)
  confirmacion/   entrada emitida con QR
  entrada/        detalle de la entrada y línea de tiempo de la garantía
  reporte/        reporte de problema de ingreso y reembolso
src/
  theme.ts        tokens de diseño
  components/     componentes reutilizables
  data/           tipos, reglas de negocio y datos semilla
  store/          estado global (Zustand) y selectores
  utils/          formato de soles y fechas
```

## Verificación

```bash
npx tsc --noEmit
```
