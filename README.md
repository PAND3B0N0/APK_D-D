# Grimorio DM — Asistente D&D 5e

Aplicación web progresiva y empaquetable para Android (`.apk`) diseñada para asistir a un **Dungeon Master (DM)** durante sus partidas de *Dungeons & Dragons 5e*. Construida con **React**, **Vite**, **Tailwind CSS** y **CapacitorJS**, consumiendo en tiempo real la API pública de D&D 5e (`https://www.dnd5eapi.co/api/`).

---

## Módulos funcionales

1. **Bestiario y enemigos de partida (`/api/monsters`)**
   - Listado paginado y búsqueda en tiempo real por nombre.
   - Filtrado por tramos de Nivel de Desafío (`ND 0–1`, `ND 2–4`, `ND 5–10`, `ND 11–16`, `ND 17+`).
   - Tarjetas reutilizables (`EntityCard`) que muestran **Nombre**, **Clase de Armadura (CA)**, **Puntos de Golpe (PG)** y **Nivel de Desafío (ND)**.
   - Panel/ficha completa con atributos (`FUE`, `DES`, `CON`, `INT`, `SAB`, `CAR`), velocidades, sentidos, resistencias, rasgos especiales, acciones y enlace directo al generador de botín con el ND del monstruo seleccionado.

2. **Generador de Loot / Botín (`/api/equipment` y `/api/magic-items`)**
   - Selector por tramo o Nivel de Desafío exacto (`0` a `30`, incluyendo `1/8`, `1/4`, `1/2`).
   - Modo **Individual** o **Tesoro de Guarida**.
   - Cálculo aleatorio de monedas (`PC`, `PP`, `PE`, `PO`, `PPt`) escalado al ND del monstruo derrotado.
   - Obtención dinámica de equipo y objetos mágicos reales desde la API de D&D 5e con descripción detallada al pulsar cada tarjeta y botón para copiar el resumen.

3. **Bandeja de Dados**
   - Soporte completo para los 7 dados estándar: `d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `d100`.
   - Configuración de cantidad de dados, modificador (`-10` a `+20`) y modo **Ventaja / Desventaja** para `1d20`.
   - Resultado visual destacado con siluetas poliédricas SVG, detección de **Crítico Natural (20)** y **Pifia (1)**, retroalimentación sonora opcional (Web Audio API) e historial de tiradas de la sesión.

---

## Requisitos y ejecución local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Verificar tipos y generar compilación web (dist/)
npm run lint
npm run build
```

---

## Despliegue en Vercel

El proyecto incluye `vercel.json` configurado para servir la aplicación SPA desde `dist/`:

1. Sube el repositorio a GitHub.
2. En [Vercel](https://vercel.com/), importa el repositorio (`Framework Preset: Vite`).
3. Haz clic en **Deploy**.
4. Añade la URL de producción generada en la descripción de tu repositorio o aquí:
   - **URL de producción (Vercel):** _Pendiente de añadir tras el despliegue_

---

## Empaquetado Android (.apk) con CapacitorJS y Android Studio

El proyecto ya incluye `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `capacitor.config.ts` y la carpeta nativa `android/` sincronizada con `dist/`.

### Opción A: Generar el APK localmente con Android Studio

```bash
# 1. Si editas el código en Visual Studio Code, recompila y sincroniza:
npm run cap:sync

# 2. Abre el proyecto nativo en Android Studio:
npm run cap:android
```

En **Android Studio**:
1. Espera a que Gradle finalice la sincronización.
2. Ve al menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. Localiza el archivo generado en `android/app/build/outputs/apk/debug/app-debug.apk`.
4. Sube el `.apk` en GitHub dentro de la sección **Releases** bajo una etiqueta como `v1.0.0`.

### Opción B: Generar el APK automáticamente con GitHub Actions

Se ha incluido el flujo `.github/workflows/android-apk.yml`:
1. Al subir tu código a GitHub (`main` o `master`), la pestaña **Actions** compilará automáticamente `app-debug.apk` y podrás descargarlo como *Artifact*.
2. Si creas y subes un *tag* de versión (por ejemplo `git tag v1.0.0 && git push origin v1.0.0`), GitHub creará la **Release `v1.0.0`** con el archivo `app-debug.apk` adjunto automáticamente.

