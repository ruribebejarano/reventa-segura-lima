# ✓ Reventa Verificada

**Prototipo de una app para comprar entradas de conciertos en reventa sin miedo a la estafa.** Está pensada para fans de Lima que se quedaron sin entrada en la preventa.

> ⚠️ **Es un prototipo para demos y pruebas con usuarios.** Todo es simulado: no hay pagos reales, no se conecta a ninguna ticketera y los datos se guardan solo en el celular o navegador de quien la usa.

---

## 📌 Índice

1. [¿Qué hace la app?](#-qué-hace-la-app)
2. [Probarla sin instalar nada](#-probarla-sin-instalar-nada)
3. [Guía para pruebas con usuarios (modo prueba)](#-guía-para-pruebas-con-usuarios-modo-prueba)
4. [Instalarla en tu computadora](#-instalarla-en-tu-computadora-paso-a-paso)
5. [Hacer cambios comunes](#-hacer-cambios-comunes-sin-saber-programar-mucho)
6. [Publicar en la web (Vercel)](#-publicar-en-la-web-vercel)
7. [Generar el APK para Android](#-generar-el-apk-para-android-expo-eas)
8. [Crear tu propia copia del proyecto](#-crear-tu-propia-copia-del-proyecto)
9. [Cómo está organizado el código](#-cómo-está-organizado-el-código)
10. [Problemas frecuentes](#-problemas-frecuentes)

---

## 💡 ¿Qué hace la app?

En WhatsApp, primero pagas y después descubres si la entrada era real. **Aquí es al revés:**

| Paso | Qué pasa |
|---|---|
| 1. Eliges una entrada | Ves el precio original y el **tope de reventa** (máximo 1,5 × el original), así sabes que no hay abuso. |
| 2. Se verifica **antes de pagar** | Se comprueba con la ticketera oficial que es auténtica y que nunca se usó. |
| 3. Pagas con garantía | El dinero queda **retenido**: el vendedor todavía no lo recibe. |
| 4. Recibes la entrada a tu nombre | Con un QR nuevo y tu DNI. El QR del vendedor queda anulado. |
| 5. Entras al concierto | Recién ahí se le paga al vendedor. **Si no puedes entrar, te devolvemos el 100 %.** |

También se pueden **vender** entradas: la app no deja publicar por encima del tope y verifica la entrada antes de publicarla.

**Pantallas:** inicio de sesión · Inicio (buscador de conciertos) · ofertas del evento · detalle · verificación · pago · confirmación con QR · Mis entradas · reporte de problema y reembolso · Vender · Perfil.

---

## 📱 Probarla sin instalar nada

| Opción | Cómo |
|---|---|
| **En el navegador (celular o PC)** | Abre el link de Vercel del proyecto (ver [Publicar en la web](#-publicar-en-la-web-vercel)). Se ve como una app de celular. |
| **En Android (APK)** | Abre el link o QR del último build en [expo.dev](https://expo.dev/accounts/ricardoub/projects/reventa-verificada/builds) → **Install**. Ver [instalar el APK](#instalar-el-apk-en-el-celular). |

En el inicio de sesión toca **"Entrar como Ana (demo)"** para entrar con un usuario de prueba, sin crear cuenta.

### Casos de demostración preparados

| Quieres mostrar… | Haz esto |
|---|---|
| Una compra exitosa | Gira Aurora 2026 → **Campo B · S/ 220** → Verificar → Pagar |
| Una entrada falsa o ya usada | Gira Aurora 2026 → oferta de **Sofía L. (Campo A, S/ 180)** → la verificación falla y no se cobra nada |
| El reembolso | Mis entradas → tu entrada → **Reportar un problema de ingreso** → a los 4 segundos: "Reembolsado ✓" |
| Simular que entraste al concierto | Mis entradas → tu entrada → **Simular ingreso al evento** |
| Vender con precio abusivo | Vender → precio mayor al máximo → aparece el error y no deja continuar |
| Vender una entrada ya usada | Vender → código que empiece con **`USED`** (por ejemplo `USED1234`) → la verificación falla |
| Volver todo al inicio | Perfil → **Reiniciar datos de la demo** |

---

## 🧪 Guía para pruebas con usuarios (modo prueba)

Pensado para el experimento con usuarios (Lab5). Mide tres cosas:
1. ¿Tocó **"Verificar"** antes de pagar?
2. ¿Completó el pago?
3. ¿Subió su **confianza** (de 1 a 5) después de ver la verificación?

**Cómo hacer una sesión:**

1. Comparte el link agregando **`/?prueba=1`** al final, por ejemplo `https://tu-dominio.vercel.app/?prueba=1`.
   - Ese link empieza una **sesión limpia**: borra compras anteriores, entra como Ana y abre directamente la Gira Aurora 2026.
2. Pide al participante que compre una entrada. La app le pregunta su confianza **antes** y **después** de la verificación.
3. Al terminar, ve a **Perfil → Sesión de prueba**. Ahí está el resumen: verificó antes de pagar (sí/no), pagó (sí/no), confianza antes → después, tiempo total y tiempo en cada pantalla.
4. Toca **Copiar resultados** y pégalos en el Experiment Board. Completa a mano la línea "Completó el pago sin ayuda", que la anota el observador.
5. Para el siguiente participante: **Nueva sesión**, o abre de nuevo el link con `/?prueba=1`.

> 💡 Usa un dispositivo o navegador por participante, o pulsa "Nueva sesión" entre uno y otro: los datos se guardan en el dispositivo.

---

## 💻 Instalarla en tu computadora (paso a paso)

Necesitas esto **una sola vez**:

| Programa | Para qué | Dónde |
|---|---|---|
| **Node.js 20 o superior** (recomendado 22 o 24) | Ejecuta el proyecto | https://nodejs.org → botón "LTS" |
| **Git** | Descargar el proyecto | https://git-scm.com/downloads |
| **Visual Studio Code** (opcional) | Ver y editar archivos | https://code.visualstudio.com |
| **Expo Go** en tu celular (opcional) | Ver la app en tu celular mientras la editas | Play Store / App Store |

Para comprobar que Node quedó instalado, abre una terminal (en Windows: **PowerShell**; en Mac: **Terminal**) y escribe `node -v`. Debe mostrar un número como `v22.x.x`.

### 1. Descargar el proyecto

```bash
git clone https://github.com/ruribebejarano/reventa-segura-lima.git
cd reventa-segura-lima
```

### 2. Instalar las dependencias (solo la primera vez, tarda unos minutos)

```bash
npm install
```

### 3. Abrir la app

```bash
npm run web
```

Se abre el navegador en `http://localhost:8081`. **Cada vez que guardes un cambio en un archivo, la app se actualiza sola.**

**Para verla en tu celular:** ejecuta `npm start`. Aparece un QR en la terminal: escanéalo con **Expo Go** (Android) o con la cámara (iPhone). El celular y la computadora deben estar en la misma red Wi-Fi.

Para detener la app: en la terminal presiona **Ctrl + C**.

---

## ✏️ Hacer cambios comunes (sin saber programar mucho)

Abre la carpeta del proyecto en Visual Studio Code. Los cambios más comunes están en pocos archivos:

| Quiero cambiar… | Archivo | Qué editar |
|---|---|---|
| **Conciertos, zonas y precios** | `src/data/seed.ts` | La lista `SEED_EVENTS` (artista, gira, recinto, fecha, zonas con su precio original). |
| **Ofertas de reventa** | `src/data/seed.ts` | Las líneas `['Campo B', 220, 'Diego R.', 4]` = zona, precio, vendedor, ventas. Si el precio supera el tope, la app avisa con un error al arrancar. |
| **Usuario demo (Ana)** | `src/data/seed.ts` | `SEED_USER` |
| **Tope de reventa o tarifa de garantía** | `src/data/rules.ts` | `TARIFA_GARANTIA = 10` y `original * 1.5` |
| **Colores, tamaños de letra, espacios** | `src/theme.ts` | Los colores están con nombre (`primary`, `accent`…). |
| **Textos de una pantalla** | `app/…` | Cada archivo es una pantalla (ver la tabla de [organización](#-cómo-está-organizado-el-código)). Busca el texto con **Ctrl + Shift + F** en VS Code. |
| **Ícono, splash y vista previa para WhatsApp** | `scripts/generar-imagenes.mjs` | Edita el dibujo y ejecuta `npm run imagenes`. |
| **Título y descripción del link en WhatsApp** | `public/index.html` | Las etiquetas `og:title`, `og:description`, `og:image`. |

> ⚠️ **Importante al cambiar `src/data/seed.ts`:** sube en 1 el número de `SEED_VERSION` (por ejemplo, de `2` a `3`). Así, quienes ya usaron la app reciben los datos nuevos en lugar de los antiguos guardados.

**Antes de subir cambios**, comprueba que no rompiste nada:

```bash
npm run check
```

Si todo está bien, no aparecen errores (revisa tipos de datos y estilo del código).

---

## 🌐 Publicar en la web (Vercel)

La web se publica gratis en [Vercel](https://vercel.com) y **se actualiza sola con cada cambio que subes a GitHub.**

**La primera vez:**
1. Entra a vercel.com → **Continue with GitHub**.
2. **Add New… → Project** → busca el repositorio → **Import**.
   - Si no aparece: **Adjust GitHub App Permissions** y dale acceso al repositorio.
3. Deja la configuración tal cual. El archivo `vercel.json` ya indica todo: Framework **Other**, Build `npx expo export -p web`, Output `dist`.
4. **Deploy**. En 1 o 2 minutos tienes tu link, por ejemplo `https://reventa-segura-lima.vercel.app`.
5. ⚠️ **Si tu dominio es distinto**, cámbialo en `public/index.html`: aparece 4 veces, en `og:url`, `og:image` y `twitter:image`. Si no, la vista previa en WhatsApp sale sin imagen.

**Después:** cada `git push` a la rama `main` genera una nueva versión, con el mismo link. En **Deployments** puedes volver a una versión anterior (**Promote**).

**Probar la versión web final en tu computadora antes de publicar:**

```bash
npm run build:web     # crea la carpeta dist/
npm run preview:web   # la abre en http://localhost:3000
```

---

## 🤖 Generar el APK para Android (Expo EAS)

Con el plan gratuito de Expo se compila en la nube; no necesitas Android Studio.

**La primera vez:**

```bash
npm install -g eas-cli   # instala la herramienta de Expo
eas login                # inicia sesión (o crea una cuenta gratis en expo.dev)
```

**Cada vez que quieras un APK nuevo:**

```bash
eas build -p android --profile preview
```

Tarda entre 10 y 20 minutos. Al final aparece un **link y un QR**, que también ves en expo.dev → tu proyecto → **Builds**. El número de versión sube solo.

### Instalar el APK en el celular
1. Abre el link o escanea el QR → **Install** → se descarga el `.apk`.
2. Ábrelo. Si Android avisa de **fuentes desconocidas**: **Configuración → Permitir de esta fuente** → vuelve → **Instalar**.
3. Si Play Protect avisa: **Instalar de todos modos**. Es normal en apps que no vienen de la Play Store.
4. Para actualizar, instala el APK nuevo encima del anterior. Los datos se conservan.

**Funciona sin internet:** los datos, las fuentes, los íconos y los QR van dentro de la app.

---

## 🍴 Crear tu propia copia del proyecto

Para que otra persona modifique la app con sus propias cuentas:

1. **Copia el repositorio:** en GitHub pulsa **Fork** (o **Use this template**). Luego sigue [Instalarla en tu computadora](#-instalarla-en-tu-computadora-paso-a-paso) con la dirección de tu copia.
2. **Conecta tu propia cuenta de Expo** (solo si vas a generar APK). El proyecto está vinculado a la cuenta del autor original, así que en `app.json`:
   - borra la línea `"owner": "ricardoub"`;
   - borra el bloque `"extra": { "eas": { "projectId": "…" } }` (deja `"router": {}` si aparece);
   - cambia `"android": { "package": "pe.reventaverificada.app" }` por uno tuyo, por ejemplo `"pe.tunombre.reventa"`;
   - ejecuta `eas login` y luego `eas init`, que crea tu proyecto y vuelve a escribir esos datos.
3. **Tu propio Vercel:** importa tu copia en Vercel y cambia el dominio en `public/index.html` (ver arriba).
4. Cambia nombres, colores y datos como se explica en [Hacer cambios comunes](#-hacer-cambios-comunes-sin-saber-programar-mucho).

---

## 🗂️ Cómo está organizado el código

```
app/                     ← PANTALLAS (cada archivo = una pantalla / una dirección web)
  login.tsx                Inicio de sesión
  (tabs)/                  Las 4 pestañas de abajo
    index.tsx                Inicio: buscador y lista de conciertos
    entradas.tsx             Mis entradas
    vender.tsx               Vender una entrada (3 pasos)
    perfil.tsx               Perfil, modo demo y resultados de la sesión de prueba
  evento/[id].tsx          Ofertas de un concierto, con el tope de precio
  oferta/[id].tsx          Detalle de una entrada antes de verificar
  verificacion/[id].tsx    Verificación con la ticketera (animada)
  pago/[id].tsx            Pago con garantía (de demostración)
  confirmacion/[orderId]   Entrada emitida con su QR
  entrada/[orderId]        Tu entrada y la línea de tiempo de la garantía
  reporte/[orderId]        Reportar un problema y reembolso
  ayuda.tsx, metodos-pago.tsx, +not-found.tsx
  _layout.tsx              Carga la fuente, protege las pantallas con sesión y el link ?prueba=1

src/
  theme.ts                 Colores, letras y espacios (diseño)
  components/              Piezas reutilizables: botones, tarjetas, QR, etc.
  data/
    seed.ts                Datos de demostración (conciertos, ofertas, usuario)
    rules.ts               Reglas: tope 1,5 × y tarifa de garantía
    types.ts               Forma de los datos
  store/                   "Memoria" de la app (compras, sesión, modo prueba), guardada en el dispositivo
  utils/                   Formato de soles y fechas, resumen de la sesión de prueba

assets/                  Ícono, ícono adaptable de Android y splash
public/                  Página web base: metadatos para WhatsApp, favicon, imagen de vista previa
scripts/                 Script que genera los íconos e imágenes
app.json                 Configuración de la app (nombre, ícono, paquete de Android)
eas.json                 Configuración para generar el APK
vercel.json              Configuración para publicar la web
```

**Tecnologías:** [Expo](https://expo.dev) (SDK 58) + React Native + TypeScript · Expo Router (pantallas) · Zustand + AsyncStorage (datos guardados en el dispositivo) · Inter (tipografía).

### Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run web` | Abre la app en el navegador |
| `npm start` | Muestra el QR para verla en el celular con Expo Go |
| `npm run check` | Revisa que no haya errores (tipos y estilo) |
| `npm run build:web` | Genera la versión web final en `dist/` |
| `npm run preview:web` | Abre esa versión final en `http://localhost:3000` |
| `npm run imagenes` | Regenera ícono, splash, favicon e imagen para WhatsApp |
| `eas build -p android --profile preview` | Genera un APK nuevo en la nube de Expo |

---

## 🆘 Problemas frecuentes

| Problema | Solución |
|---|---|
| `npm` o `node` "no se reconoce como comando" | Instala Node.js y **cierra y vuelve a abrir** la terminal. |
| `npm install` falla | Comprueba tu versión con `node -v` (debe ser 20 o más). Borra la carpeta `node_modules` y repite `npm install`. |
| El puerto 8081 está ocupado | Ya hay otra copia abierta: ciérrala con Ctrl + C o usa `npx expo start --web --port 8082`. |
| Expo Go no carga la app | Celular y computadora en la misma Wi-Fi. Si no funciona, prueba `npx expo start --tunnel`. |
| Veo datos viejos tras cambiar `seed.ts` | Sube `SEED_VERSION` en `src/data/seed.ts`, o en la app: Perfil → **Reiniciar datos de la demo**. |
| La vista previa de WhatsApp no tiene imagen | El dominio de `public/index.html` no coincide con el de Vercel. WhatsApp guarda en caché la vista previa: prueba el link con `/?v=2` al final. |
| El link de Vercel da 404 | En Vercel → **Settings → Git**, confirma que el repositorio esté conectado, y revisa el registro en **Deployments**. |

---

Hecho con Expo · Prototipo académico/demostrativo, sin pagos reales.
