// Genera el favicon, el ícono para iPhone y la imagen de vista previa (OG) a partir de SVG.
// Uso: node scripts/generar-imagenes.mjs
import { Buffer } from 'node:buffer';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRIMARIO = '#2A9D8F';
const PRIMARIO_OSCURO = '#1D7468';
const NAVY = '#14213D';
const FUENTE = "Inter, 'Segoe UI', Arial, Helvetica, sans-serif";

/** Check blanco dentro de un cuadrado redondeado verde azulado. */
const icono = (lado, radio) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${radio}" fill="${PRIMARIO}"/>
  <path d="M27 52 L43 68 L74 34" fill="none" stroke="#fff" stroke-width="11"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const pildora = (x, y, texto, ancho) => `
  <g transform="translate(${x} ${y})">
    <rect width="${ancho}" height="56" rx="28" fill="#ffffff" fill-opacity="0.16" stroke="#ffffff" stroke-opacity="0.35"/>
    <path d="M24 29 L32 37 L46 21" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="60" y="37" font-family="${FUENTE}" font-size="24" font-weight="600" fill="#fff">${texto}</text>
  </g>`;

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${PRIMARIO}"/>
      <stop offset="1" stop-color="${PRIMARIO_OSCURO}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#fondo)"/>
  <circle cx="1080" cy="80" r="220" fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="1130" cy="600" r="160" fill="#ffffff" fill-opacity="0.05"/>

  <!-- Marca -->
  <g transform="translate(80 84)">
    <rect width="112" height="112" rx="28" fill="#ffffff"/>
    <path d="M30 58 L50 78 L84 38" fill="none" stroke="${PRIMARIO}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="222" y="158" font-family="${FUENTE}" font-size="68" font-weight="700" fill="#ffffff">Reventa Verificada</text>

  <text x="80" y="290" font-family="${FUENTE}" font-size="46" font-weight="700" fill="#ffffff">Entradas de reventa comprobadas</text>
  <text x="80" y="348" font-family="${FUENTE}" font-size="46" font-weight="700" fill="#ffffff">con la ticketera oficial.</text>
  <text x="80" y="408" font-family="${FUENTE}" font-size="28" fill="#E3F2EF">Tu dinero queda protegido hasta que ingreses al concierto.</text>

  ${pildora(80, 470, 'Verificada antes de pagar', 380)}
  ${pildora(476, 470, 'QR nuevo a tu nombre', 330)}
  ${pildora(822, 470, 'Pago protegido', 260)}

  <text x="80" y="590" font-family="${FUENTE}" font-size="22" fill="${NAVY}" fill-opacity="0.75">Conciertos en Lima</text>
</svg>`;

/**
 * Entrada estilizada (ticket con muescas y perforación) con un check blanco.
 * Se dibuja en un lienzo de 1024 y se escala con `escala` alrededor del centro.
 */
const ticket = ({ escala = 1, relleno = '#ffffff', opacidadRelleno = 0.18, trazo = '#ffffff', check = '#ffffff' } = {}) => `
  <defs>
    <mask id="muescas">
      <rect width="1024" height="1024" fill="#fff"/>
      <circle cx="172" cy="512" r="64" fill="#000"/>
      <circle cx="852" cy="512" r="64" fill="#000"/>
    </mask>
  </defs>
  <g transform="translate(512 512) scale(${escala}) rotate(-8) translate(-512 -512)">
    <g mask="url(#muescas)">
      <rect x="172" y="282" width="680" height="460" rx="64" fill="${relleno}" fill-opacity="${opacidadRelleno}"
            stroke="${trazo}" stroke-width="26"/>
    </g>
    <line x1="672" y1="330" x2="672" y2="694" stroke="${trazo}" stroke-width="16" stroke-linecap="round" stroke-dasharray="2 44"/>
    <path d="M300 520 L392 610 L560 428" fill="none" stroke="${check}" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;

/** Ícono de la app (iOS, Expo y tiendas): fondo verde azulado de borde a borde. */
const iconoApp = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${PRIMARIO}"/>
  ${ticket({ escala: 0.95 })}
</svg>`;

/** Primer plano del ícono adaptable: transparente y dentro de la zona segura (66 % central). */
const iconoAdaptable = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${ticket({ escala: 0.62 })}
</svg>`;

/** Ícono monocromo (Android 13+ lo tiñe con el tema): solo formas blancas sólidas. */
const iconoMonocromo = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${ticket({ escala: 0.62, opacidadRelleno: 0 })}
</svg>`;

/** Splash: check en recuadro + "Reventa Verificada", blanco sobre transparente (el fondo lo pone el plugin). */
const splash = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300">
  <g transform="translate(40 70)">
    <rect width="160" height="160" rx="40" fill="#ffffff"/>
    <path d="M42 84 L70 112 L120 54" fill="none" stroke="${PRIMARIO}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="236" y="190" font-family="${FUENTE}" font-size="104" font-weight="700" fill="#ffffff">Reventa Verificada</text>
</svg>`;

async function png(svg, destino, ancho, alto = ancho) {
  const archivo = path.join(raiz, destino);
  await mkdir(path.dirname(archivo), { recursive: true });
  await sharp(Buffer.from(svg)).resize(ancho, alto).png().toFile(archivo);
  console.log('✓', destino, `${ancho}x${alto}`);
}

await png(icono(48, 22), 'public/favicon.png', 48);
await png(icono(48, 22), 'assets/images/favicon.png', 48);
// iOS recorta las esquinas solo: cuadrado sin redondeo.
await png(icono(180, 0), 'public/apple-touch-icon.png', 180);
await png(og, 'public/og.png', 1200, 630);

// App nativa (Android / iOS)
await png(iconoApp, 'assets/icon.png', 1024);
await png(iconoAdaptable, 'assets/adaptive-icon.png', 1024);
await png(iconoMonocromo, 'assets/adaptive-icon-monochrome.png', 1024);
await png(splash, 'assets/splash.png', 1200, 300);
