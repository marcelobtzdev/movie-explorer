# MovieExplorer

App móvil (React Native CLI + TypeScript) que consume la [API de TMDB](https://developer.themoviedb.org/docs/getting-started) para explorar las películas populares, buscar por título y ver el detalle de cada película. Funciona en Android e iOS.

Las decisiones de arquitectura están en [`docs/adr/`](./docs/adr). Las reglas del proyecto están en [`.specify/memory/constitution.md`](./.specify/memory/constitution.md).

Funcionalidades implementadas: películas populares con scroll infinito, búsqueda por título y detalle de película. En [Características](#características) se explica qué hace cada una y por qué se eligió cada librería.

## Características

### 1. Lista de películas populares

- La pantalla principal muestra las películas más populares de TMDB en una **cuadrícula de dos columnas**, con una **tarjeta destacada** para la primera película (backdrop ancho, valoración, géneros y año de estreno). El resto va en la cuadrícula, y la primera película nunca aparece dos veces.
- El catálogo de géneros se carga **antes** que la lista (`GET /genre/movie/list`), para que cada tarjeta muestre nombres de género en lugar de ids. El diccionario se construye una vez por respuesta y se pasa como props.
- **Por qué FlashList:** `@shopify/flash-list` recicla celdas en lugar de mantener una vista por elemento, así que una cuadrícula larga se mantiene fluida incluso en equipos modestos. `drawDistance` (250) renderiza solo los elementos cercanos a la pantalla, `numColumns` genera la cuadrícula, y el encabezado de la lista (pestañas, tarjeta destacada y título de sección) se desplaza con el contenido.
- **Por qué tarjetas memorizadas:** `MovieCard` está envuelta en `React.memo` y recibe callbacks estables, así que las celdas recicladas no se vuelven a renderizar salvo que cambie su película.

### 2. Scroll infinito (paginación)

- La siguiente página se carga cuando el usuario está a media pantalla del final (`onEndReachedThreshold` 0.5), sin botón.
- Una página nueva se pide solo si no hay otra cargando y nunca después de un error (el pie de la lista muestra entonces un botón de reintentar). Un scroll repetido hasta el final no dispara una segunda petición.
- TMDB limita la paginación a 500 páginas, así que `getNextPageParam` se detiene en `min(total_pages, 500)`.
- Las películas que aparecen en más de una página (las páginas de TMDB pueden solaparse) se eliminan por id en el `select` de la consulta, no durante el render.
- **Por qué `useInfiniteQuery`:** TanStack Query conserva todas las páginas cargadas en la caché, así que volver a la lista no vuelve a pedir las páginas ya vistas.

### 3. Búsqueda por título

- El campo de búsqueda está encima de las pestañas. El texto escrito tiene un **debounce de 300 ms**: solo entonces se confirma el término recortado, así que se envía una petición por pausa y no por cada tecla.
- Borrar el campo (borrando el texto o con la acción de limpiar) vuelve de inmediato al listado popular, y sus datos salen de la caché.
- Los resultados usan el mismo diseño que el listado. Los resultados del término anterior se mantienen visibles mientras carga el nuevo (`keepPreviousData`), así que la pantalla no parpadea vacía.
- La búsqueda muestra solo la **primera página** de resultados (TMDB devuelve hasta 20 películas por página). Mostrar más requeriría el parámetro `page` y scroll infinito; la decisión está en la spec.
- **Por qué React Hook Form + Zod:** el campo es el único formulario de la app. React Hook Form mantiene su estado fuera del ciclo de render de React, y Zod valida el valor recortado (máximo 100 caracteres) a través de `zodResolver`.
- **Por qué Zustand para una sola cadena:** el término confirmado lo comparten el hook de búsqueda y la pantalla, y se lee fuera de React cuando hace falta. Los resultados del servidor nunca se copian a Zustand; viven en TanStack Query bajo la clave `moviesKeys.search(term)`.

### 4. Detalle de película

- Tocar una tarjeta de la cuadrícula, la tarjeta destacada o un resultado de búsqueda abre la pantalla de detalle (navegación nativa por stack, con parámetros tipados: solo `{ movieId }`).
- El detalle carga `GET /movie/{movieId}` y muestra la imagen de fondo, el título, la fecha de estreno en formato largo en español ("1 de marzo de 2024"), los chips de géneros y la sinopsis.
- **Prefetch al tocar:** antes de navegar, la app precarga la imagen del detalle con `Image.prefetch`, así que suele estar lista cuando se abre la pantalla. Si la precarga falla, se ignora.
- **Caché:** la consulta del detalle tiene un `staleTime` de 10 minutos, así que volver a abrir la misma película no espera a la red.
- Estados: un skeleton con el diseño final mientras carga; un error con "Reintentar" que repite solo la petición del detalle; un mensaje de "no encontrada" para un `404`, sin botón de reintentar.

### 5. Estados de carga, error, vacío y sin conexión

- **Skeleton** (átomo `Skeleton`): un placeholder con brillo que tiene el mismo diseño que el contenido, así la página no salta cuando llegan los datos. Los bloques dentro de un mismo `Skeleton.Group` se animan sincronizados. El brillo es una animación de `react-native-reanimated` que corre en el hilo de UI a través de `react-native-worklets`, así que no compite con el trabajo de JavaScript.
- **Estados inline:** el listado y el detalle muestran sus propios estados de error, vacío y no encontrado, con acciones de reintentar o volver. El encabezado, las pestañas y el menú inferior siguen visibles.
- **Overlays globales:** los fallos de red y de servidor de las consultas que no manejan su propio error muestran un overlay a pantalla completa con reintentar, controlado por stores de Zustand. Las pantallas que manejan sus propios errores se excluyen con `meta: { skipNetworkError, skipServerError }`, para no mostrar el mismo error dos veces.
- **Sin conexión:** `@react-native-community/netinfo` detecta los cambios de conexión. El contenido que ya está en pantalla se mantiene; cuando vuelve la conexión, la app muestra un toast y vuelve a pedir las consultas activas.

### 6. Imágenes

- TMDB sirve cada imagen en varios tamaños, y la app pide el tamaño que necesita cada lugar: pósteres de la cuadrícula `w342`, backdrop de la tarjeta destacada `w780`, backdrop del detalle `w1280`. Tamaños más pequeños significan menos datos y menos memoria.
- El átomo `Poster` es el único componente que renderiza imágenes. Define dimensiones explícitas, usa `resizeMode="cover"`, muestra un placeholder cuando no hay ruta y cae en el mismo placeholder si la imagen no carga.
- En Android la imagen usa `resizeMethod="resize"`, así que se decodifica al tamaño mostrado y no a su resolución completa.
- Las URLs de imagen se construyen con `buildTmdbImageUrl` a partir de la constante `https://image.tmdb.org/t/p/` y de los tamaños de `src/constants/tmdb.ts`. La app no llama al endpoint `/configuration` de TMDB.

### 7. Accesibilidad y diseño

- Cada elemento interactivo tiene `accessibilityRole` y etiqueta; las áreas de toque miden al menos 44x44 pt (los elementos visuales pequeños usan `hitSlop` para alcanzar ese tamaño).
- La pantalla respeta las áreas seguras (el menú inferior controla el margen inferior) y admite el tamaño de fuente del sistema.
- El campo de búsqueda mantiene el teclado abierto cuando se toca un resultado, y lo cierra cuando el usuario hace scroll en los resultados.

### 8. Configuración y calidad

- **Entorno:** `react-native-config` lee `.env` y Zod lo valida al iniciar. Si falta `TMDB_BASE_URL` o `TMDB_ACCESS_TOKEN`, o tienen un formato incorrecto, la app muestra un error claro en lugar de fallar más tarde en una petición.
- **Build de producción:** `babel-plugin-transform-remove-console` elimina las llamadas `console.*`. Reactotron solo se carga en desarrollo (`if (__DEV__)` en `index.js`).
- **Pruebas:** cada feature tiene pruebas unitarias, de hooks, de componentes y de pantalla, colocadas junto al código, con Jest y React Native Testing Library. `pnpm pr:check` ejecuta lint, tipos y pruebas.

### 9. Simulación de errores (solo desarrollo)

Permite ver cómo se comportan el listado, la búsqueda y el detalle cuando fallan las peticiones, sin cambiar el token ni reconstruir la app. Se explica con detalle en [Probar el manejo de errores](#probar-el-manejo-de-errores).

## Stack tecnológico

Las versiones son las fijadas en `package.json`.

### Núcleo

| Área | Tecnología | Notas |
| --- | --- | --- |
| Framework | React Native 0.88 (CLI, flujo bare), React 19 | New Architecture y Hermes activados |
| Lenguaje | TypeScript 6 (strict) | Alias de ruta `@/src/*` |
| Gestor de paquetes | pnpm | `nodeLinker: hoisted` en `pnpm-workspace.yaml` (lo requiere React Native) |
| Runtime | Node.js `^22.13.0`, `^24.3.0` o `>=26.0.0` | Ver [Requisitos previos](#requisitos-previos) |
| Plataformas | Android e iOS | El mismo comportamiento en ambas |

### Librerías de la app

| Necesidad | Paquete | Cómo se usa |
| --- | --- | --- |
| Navegación | `@react-navigation/native` + `@react-navigation/native-stack` 7, `react-native-screens`, `react-native-safe-area-context` | Un solo stack nativo; nombres de ruta en `src/navigation/routes.ts` |
| Estado del servidor | `@tanstack/react-query` 5 | Patrón keys → service → hook; `useInfiniteQuery` para la paginación de populares |
| Estado global del cliente | `zustand` 5 | Stores pequeños en memoria: overlays de error de red y servidor, notificaciones toast y el término de búsqueda confirmado. Sin persistencia. Se eligió sobre Redux para evitar código repetitivo en una app pequeña (ADR-0004) |
| HTTP | `axios` | Un solo `tmdbClient` (URL base y token Bearer desde `.env`, `language=es-PY` en cada petición, errores normalizados a `AppError`) |
| Formularios | `react-hook-form` 7 + `@hookform/resolvers` 5 | El campo de búsqueda, validado con un esquema Zod a través de `zodResolver` |
| Validación | `zod` 4 | Valida las variables de entorno al iniciar y el formulario de búsqueda |
| Listas | `@shopify/flash-list` 2 | Cuadrícula de 2 columnas con reciclaje de celdas (ADR-0011), ver [Características](#1-lista-de-películas-populares) |
| Skeleton | `react-native-reanimated` 4 (con `react-native-worklets`) + `react-native-linear-gradient` | Átomo `Skeleton` propio con brillo (ADR-0013, reemplaza la elección de Moti del ADR-0012) |
| Conectividad | `@react-native-community/netinfo` | Detecta el estado sin conexión; al reconectar vuelve a pedir las consultas |
| Entorno | `react-native-config` | Lee `.env` (`TMDB_BASE_URL`, `TMDB_ACCESS_TOKEN`) |
| UI | Componentes propios con `StyleSheet.create` | Atomic Design + tokens de tema oscuro en `src/theme`; sin librería de UI (ADR-0007) |
| Textos | Constantes en español (es-PY) en archivos `strings.ts` | Sin librería de internacionalización |
| Depuración en desarrollo | `reactotron-react-native` | Solo en desarrollo; protegido con `__DEV__` |

### Datos y caché

- **API:** TMDB v3 (`GET /movie/popular`, `GET /genre/movie/list`, `GET /search/movie`, `GET /movie/{movieId}`), idioma `es-PY` en cada petición.
- **Géneros primero:** el catálogo de géneros se pide una vez antes que la lista (condiciona la consulta de la lista) y se resuelve por id a nombres.
- **Caché de consultas:** listado popular y búsqueda con `staleTime` de 5 min; detalle con `staleTime` de 10 min; `gcTime` de 30 min; géneros con `staleTime` y `gcTime` de 24 h; reintentos automáticos desactivados (cada "Reintentar" manual hace exactamente una petición).
- **Cancelación de peticiones:** los servicios reciben el `AbortSignal` de TanStack Query y lo pasan a Axios.
- **Paginación:** scroll infinito (umbral 0.5, sin cargas concurrentes duplicadas), limitada a `min(total_pages, 500)` (límite de TMDB) y sin duplicados por id.
- **Manejo global de errores:** el `QueryClient` envía los errores de red y de servidor a los stores de overlay de Zustand. Las consultas cuyas pantallas muestran su propio estado de error pasan `meta: { skipNetworkError, skipServerError, skipNotify }`.
- **Imágenes:** tamaños de TMDB según el uso (`w342` pósteres de la cuadrícula, `w780` backdrop destacado, `w1280` backdrop del detalle), dimensiones explícitas, placeholder y fallback, `resizeMethod="resize"` en Android. Detalles en [Características](#6-imágenes).

### Herramientas de calidad

| Herramienta | Configuración |
| --- | --- |
| ESLint | Configuración `@react-native` + `eslint-plugin-perfectionist` (objetos, interfaces y props JSX ordenados), `react-native/no-inline-styles`, `react/prefer-read-only-props`, advertencia para `no-console`, imports de tipos consistentes, `reactotron/no-tron-in-production`. `pnpm lint:check` falla con cualquier advertencia |
| Prettier | Comillas simples, comas finales, sin paréntesis en funciones de una sola flecha |
| TypeScript | Strict, se verifica con `pnpm types` (`tsc --noEmit`) |
| Jest | `@react-native/jest-preset` + `@testing-library/react-native`, cobertura v8, pruebas junto al código, `react-native-config` simulado |
| Husky | `pre-commit`: `lint-staged` (ESLint `--fix` en JS/TS, Prettier en JSON/MD). `pre-push`: `commitlint` sobre los commits a subir, y después `pnpm pr:check` |
| commitlint | `@commitlint/config-conventional` (encabezado máximo 150 caracteres, líneas del cuerpo máximo 100) |
| Babel | `module-resolver` (alias `@/src`), `transform-remove-console` en builds de producción, transformación de Zod para exportaciones de espacio de nombres primero, plugin de worklets al final (Reanimated 4) |

### Estructura del proyecto

```
src/
├── features/      # Slices por funcionalidad (movies, genres, movie-detail), cada uno con su api, hooks, componentes y pantallas
├── components/    # UI compartida (Atomic Design: atoms, molecules, organisms, templates)
├── stores/        # Stores globales de Zustand
├── vendors/       # Envoltorios de librerías externas (axios, react-query, react-navigation, netinfo, linear-gradient, reactotron, dev-error-simulator)
├── navigation/    # Stack raíz, constantes de rutas y tipos de navegación
├── hooks/         # Hooks compartidos
├── theme/         # Tokens de diseño (colores, espaciado, tipografía)
├── constants/     # Entorno, TMDB, caché de consultas, ajustes de listas, textos
├── utils/         # Utilidades puras
└── assets/        # Recursos estáticos
docs/adr/          # Registros de decisiones de arquitectura (ADR)
specs/             # Specs, planes y tareas de Spec Kit
```

### Flujo guiado por especificaciones

Las funcionalidades se especifican con [Spec Kit](https://github.com/github/spec-kit): `.specify/memory/constitution.md` contiene las reglas globales y cada funcionalidad vive en `specs/NNN-nombre/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md`).

## Requisitos previos

Las versiones exactas que aparecen abajo son las que realmente exigen `react-native@0.88` y los proyectos nativos de esta app. Se comprobaron contra el campo `engines` de `node_modules/react-native/package.json`, `android/build.gradle`, `android/gradle/wrapper/gradle-wrapper.properties` y `node_modules/react-native/scripts/cocoapods/helpers.rb`, no son aproximaciones. Ejecuta `node -v`, `java -version`, `pod --version`, etc., para comparar con tu máquina antes de continuar.

Comunes a ambas plataformas:

| Herramienta | Versión requerida | Cómo verificarla |
| --- | --- | --- |
| Node.js | `^22.13.0`, `^24.3.0` o `>=26.0.0` (ver nota abajo) | `node -v` |
| pnpm | La última ([guía de instalación](https://pnpm.io/installation)) | `pnpm -v` |
| Git | Cualquier versión reciente | `git --version` |

> **Nota sobre la versión de Node:** si `node -v` no cumple el rango de arriba, instala una versión compatible con [nvm](https://github.com/nvm-sh/nvm) o [Volta](https://volta.sh/) en lugar de cambiar el Node del sistema. `nvm install 22.13.0 && nvm use 22.13.0` (o cualquier versión de la misma línea mayor) basta para este proyecto.

Android:

| Herramienta | Versión requerida | Cómo verificarla |
| --- | --- | --- |
| JDK | 17 (necesario para ejecutar Gradle 9.4.1) | `java -version` |
| Android Studio | La última estable (incluye el SDK de Android y un emulador) | — |
| Plataforma del SDK de Android | API 37 (`compileSdk`); API 36 (`targetSdk`); API 24 mínimo (`minSdk`). Android Studio la instala con su SDK Manager la primera vez que abres el proyecto | — |
| NDK de Android | Cualquier versión. Gradle descarga la predeterminada en el primer build si no hay ninguna instalada (o instálala con "NDK (Side by side)" desde el SDK Manager) | `ls $ANDROID_HOME/ndk` |
| Gradle | 9.4.1 (lo descarga el wrapper de Gradle; no lo instales por separado) | — |

Define la variable de entorno `ANDROID_HOME` con la carpeta de tu SDK de Android, y agrega `platform-tools` y `emulator` a tu `PATH`. Estas son las rutas por defecto de Android Studio:

- **macOS:** `$HOME/Library/Android/sdk`. Agrega a `~/.zshrc`:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
  ```
- **Linux:** `$HOME/Android/Sdk`. Agrega las mismas líneas a `~/.bashrc` o `~/.zshrc`, con esa ruta.
- **Windows:** `%LOCALAPPDATA%\Android\Sdk`. Define `ANDROID_HOME` en las variables de entorno del sistema y agrega `platform-tools` y `emulator` a `Path`.

Abre una terminal nueva después de cambiarlas. `android/local.properties` depende de la máquina y está en `.gitignore`: Android Studio lo crea al abrir el proyecto, y mientras no exista, Gradle usa `ANDROID_HOME`.

iOS (solo macOS):

| Herramienta | Versión requerida | Cómo verificarla |
| --- | --- | --- |
| Xcode | `16.1` o más reciente | `xcodebuild -version` |
| Versión mínima de iOS | `15.1` (la fija el Podfile; los simuladores o dispositivos anteriores no son compatibles) | — |
| CocoaPods | `1.13` o más reciente (no `1.15.0` ni `1.15.1`, que excluye el `Gemfile`) | `pod --version` |
| Ruby | `2.6.10` o más reciente (ver `Gemfile`) | `ruby -v` |

Para la instalación inicial de Android Studio y Xcode, sigue la [guía oficial de React Native](https://reactnative.dev/docs/set-up-your-environment) (pestaña React Native CLI).

## 1. Obtén un token de TMDB

1. Crea una cuenta gratuita en [themoviedb.org](https://www.themoviedb.org/signup).
2. Ve a **Configuración → API** y solicita una clave de API (gratuita).
3. Copia el **API Read Access Token** (el token largo, no la clave corta).

## 2. Configura las variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y pon tu token (la URL base ya viene en `.env.example`):

```
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_ACCESS_TOKEN=tu_read_access_token
```

`.env` está en `.gitignore` y nunca debe subirse al repositorio. La app valida las variables al iniciar y muestra un error claro si falta alguna.

> Después de cambiar `.env`, reconstruye la app (no basta con recargarla): los valores se incrustan al compilar.

## 3. Instala las dependencias

```bash
pnpm install
```

pnpm necesita dependencias planas (hoisted) para la configuración de Gradle de React Native, que espera un layout plano de `node_modules` (por ejemplo, `includeBuild("../node_modules/@react-native/gradle-plugin")` en `android/settings.gradle`).
Esto se configura con `nodeLinker: hoisted` en `pnpm-workspace.yaml`. **Ese archivo, no `.npmrc`**, es el que pnpm lee para esta opción cuando existe `pnpm-workspace.yaml` (pnpm 12.x ignora en silencio el `node-linker` de `.npmrc` en ese caso). No elimines la línea `nodeLinker` de `pnpm-workspace.yaml`. Si aparece un error de Gradle como `Included build '.../node_modules/@react-native/gradle-plugin' does not exist`, esa configuración se perdió o se sobrescribió: confírmala y luego ejecuta `rm -rf node_modules && pnpm install`.

Solo en iOS, instala los pods nativos:

```bash
cd ios && pod install && cd ..
```

Vuelve a ejecutar `pnpm install` (y `pod install` en iOS) cada vez que agregues o actualices una dependencia con código nativo.

## 4. Ejecuta la app

Inicia Metro en una terminal y déjala abierta:

```bash
pnpm start
```

Después, en una segunda terminal, compila y lanza en la plataforma que quieras:

### Android

1. Abre un emulador de Android desde el Device Manager de Android Studio, **o** conecta un dispositivo físico con la depuración USB activada (`adb devices` debe listarlo).
2. Ejecuta:
   ```bash
   pnpm android
   ```
   La primera vez compila el proyecto nativo, así que puede tardar varios minutos. La app se instala y se abre sola cuando termina.

### iOS (solo macOS)

1. No hace falta abrir el simulador a mano: `pnpm ios` inicia el simulador predeterminado. Para usar otro dispositivo, ejecuta `npx react-native run-ios --list-devices` para ver los nombres disponibles y después `pnpm ios -- --simulator="iPhone 16"` (o `--device` para un dispositivo físico conectado por cable).
2. Ejecuta:
   ```bash
   pnpm ios
   ```
   La primera vez también compila el proyecto nativo con Xcode y CocoaPods, así que puede tardar varios minutos.

La app debe compilar y ejecutarse sin errores en ambas plataformas. Si falla una compilación nativa, revisa la sección [Solución de problemas](#solución-de-problemas) antes de volver a intentarlo.

## Probar el manejo de errores

Esta sección explica cómo comprobar que la app se comporta bien cuando fallan las peticiones a TMDB. No necesitas cambiar tu token ni reconstruir la app.

### Cómo activar la simulación

1. Ejecuta la app en desarrollo (`pnpm start` y después `pnpm ios` o `pnpm android`).
2. Abre el menú de desarrollo de React Native: **Cmd+D** en el simulador de iOS, **Cmd+M** en el emulador de Android, o sacude el dispositivo.
3. Elige un item **"Simular: ..."**:

| Modo | Qué pasa con cada petición a TMDB |
| --- | --- |
| **Simular: sin conexión** | Falla como error de red, sin código HTTP |
| **Simular: servidor 500** | Responde HTTP 500 |
| **Simular: 401** | Responde HTTP 401 (token inválido) |
| **Simular: fallar 3 y recuperar** | Las siguientes 3 peticiones fallan y después todas funcionan. Sirve para probar Reintentar |
| **Simular: normal** | Vuelve a las peticiones reales |

El modo se aplica a la siguiente petición, sin recargar la app. Al recargar, la app vuelve a **normal**.

### Qué se ve en pantalla

Cuando una petición falla, la pantalla muestra su estado de error con el mensaje normal (por ejemplo, "No pudimos cargar las películas" o "No pudimos cargar la película") y un botón **Reintentar**. En desarrollo, debajo del mensaje aparece además una línea gris `[dev]` que indica el tipo de fallo:

| Modo | Línea `[dev]` que debe aparecer |
| --- | --- |
| Sin conexión | `[dev] sin conexión` |
| Servidor 500 | `[dev] HTTP 500` |
| 401 | `[dev] HTTP 401` |

La línea `[dev]` no aparece en producción.

### Pasos para probar

**Importante:** las pantallas usan caché. Un error solo se ve si la app pide datos nuevos. Si ya tienes el listado o los géneros cargados, cambiar de modo no provoca nada hasta que pidas algo que no está en caché:

- **Para el listado:** escribe un término de búsqueda que no hayas buscado antes (por ejemplo, `dune`). La búsqueda muestra el error inline, con su `[dev]`.
- **Para el detalle:** abre una película que no hayas abierto antes en la sesión.
- **Para "fallar 3 y recuperar":** con el modo activo, busca un término nuevo. La primera petición falla y aparece el error. Pulsa **Reintentar** tres veces: las tres primeras fallan y la cuarta carga los resultados.

Una vez agotados los tres fallos del modo "fallar 3", las siguientes peticiones funcionan aunque sigas en ese modo. Para volver a probarlo, elige el modo de nuevo.

### Resultados esperados

| Prueba | Resultado |
| --- | --- |
| Sin conexión, primera carga del listado | Estado de error con `[dev] sin conexión`, y Reintentar funciona al volver al modo normal |
| Servidor 500 al abrir un detalle nuevo | "No pudimos cargar la película" con `[dev] HTTP 500` |
| 401 al buscar un término nuevo | Estado de error con `[dev] HTTP 401` |
| Fallar 3 y recuperar | Tres errores seguidos con Reintentar, y después los datos |
| Película inexistente (404) | "No encontramos esta película." con Volver, sin Reintentar. **El simulador no genera 404**: esta respuesta solo se prueba con las pruebas automáticas |
| Error al cargar la página siguiente del listado | Aparece "No se pudieron cargar más películas" con Reintentar, sin línea `[dev]` |

### Límites de la simulación

- Los fallos se generan en el cliente, antes de salir a la red. No se simulan timeouts ni conexiones que se caen a mitad de una respuesta.
- No hay modo para 404. Esa respuesta está cubierta por las pruebas automáticas.
- La simulación solo está activa cuando `__DEV__` es verdadero (`src/vendors/dev-error-simulator`, spec `specs/004-dev-error-simulation`).

### Pruebas automáticas del manejo de errores

Las mismas reglas están cubiertas por pruebas automáticas, sin necesidad de un dispositivo:

```bash
pnpm test -- src/vendors/dev-error-simulator   # modos de simulación, interceptor y menú
pnpm test -- src/vendors/react-query            # overlays globales según las flags de cada consulta
pnpm test -- src/features/movies/screens         # estados del listado, búsqueda y paginación
pnpm test -- src/features/movie-detail           # estados del detalle, incluido el 404
pnpm test -- src/utils/describe-error            # etiquetas [dev]
```

## Scripts

| Script | Descripción |
| --- | --- |
| `pnpm start` | Inicia el bundler Metro |
| `pnpm android` | Compila y ejecuta en Android |
| `pnpm ios` | Compila y ejecuta en iOS |
| `pnpm test` | Ejecuta las pruebas con cobertura |
| `pnpm test:watch` | Ejecuta las pruebas en modo observador |
| `pnpm test:ci` | Pruebas con cobertura para CI (`--detectOpenHandles --forceExit`) |
| `pnpm coverage` | Informe de cobertura |
| `pnpm lint` | ESLint |
| `pnpm lint:check` | ESLint (sin autocorrección, falla con advertencias) |
| `pnpm types` | Verificación de TypeScript (`tsc --noEmit`) |
| `pnpm pr:check` | `lint:check` + `types` + `test` (debe pasar antes de abrir un PR) |

## Solución de problemas

- **Problemas con la caché de Metro:** `pnpm start --reset-cache`
- **Falla el build de Android después de cambiar dependencias:** `cd android && ./gradlew clean && cd ..`
- **"SDK location not found":** `ANDROID_HOME` no está definido en la terminal donde ejecutas `pnpm android`. Defínelo como se indica en Requisitos previos, abre una terminal nueva y ejecuta `echo $ANDROID_HOME` para confirmar que imprime la ruta del SDK.
- **Falla el build de iOS después de cambiar dependencias:** `cd ios && pod install --repo-update && cd ..`
- **"Missing environment variable" al iniciar:** revisa que exista `.env`, que contenga `TMDB_BASE_URL` y `TMDB_ACCESS_TOKEN`, y que hayas reconstruido la app.
- **El valor de `.env` no se refleja en la app:** los valores se incrustan al compilar. Reconstruye con `pnpm android` o `pnpm ios`; recargar o reiniciar Metro no basta.
- **TMDB responde 401:** el token es incorrecto, o usaste la clave corta de API en lugar del Read Access Token.
