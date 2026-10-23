# Plan para retomar DailyAches

Creado: 2026-10-22. Es una propuesta: las fases 0 a 2 salen del estado verificado del repo; las fases 3 a 5 son ideas por validar con el dueño del proyecto.

Convención: `[ ]` pendiente, `[x]` hecho. Esfuerzo: S (horas), M (1-2 días), L (varios días).

## Preguntas abiertas (definen el alcance)

- [ ] ¿La app es personal o se publicará en tiendas?
- [ ] ¿`Dailyaches-api` está operativo y se puede modificar? Varias funcionalidades de la fase 4 requieren cambios en el backend.
- [ ] ¿Se mantiene el tono humorístico del roadmap original o se prioriza el tono "humano y calmado" de `.github/instructions/dailyaches-ui.instructions.md`?

---

## Fase 0: Ponerla a correr (S–M)

Objetivo: saber qué funciona hoy.

- [ ] Mergear `refactor/260424-add-skill` a `develop` y dejar `CLAUDE.md` y este plan commiteados.
- [x] Las dependencias instaladas son coherentes y `expo export --platform android` genera el bundle sin errores (2026-10-22). Falta abrir la app en un emulador o dispositivo.
- [x] Smoke test contra `Dailyaches-api` local (2026-10-22), por curl y no desde la app: registro, login, `/auth/me`, crear persona, tipo de dolor y registro, listar `/records` y `/records/today`, borrar todo y un 401 sin token. Todo respondió bien. Falta probarlo desde la app en un dispositivo o emulador.
- [ ] Anotar cada fallo encontrado en una sección "Bugs detectados" al final de este archivo.
- [x] `constants/api.js`: quitar la IP `192.168.1.10` hardcodeada, usar solo `EXPO_PUBLIC_API_URL` y añadir `.env.example`.
- [x] Quitar el `console.log` de requests en `utils/httpService.js` (o dejarlo solo bajo `__DEV__`).

## Fase 1: Base técnica y deuda (M–L)

Objetivo: poder cambiar cosas sin romperlas.

- [ ] Partir `context/UserContext.js` en piezas. Hecho (2026-10-22): la gamificación y los valores por defecto pasaron a `utils/gamification.js` como funciones puras, los mapeos API a estado a `utils/apiMappers.js` y se quitaron los `console.log` de depuración (997 a 746 líneas). Pendiente: separar `AuthContext` y el contexto de datos remotos (personas, tipos de dolor, registros), manteniendo `useUser()` como fachada.
- [ ] Definir una sola fuente de verdad: con sesión manda la API y AsyncStorage queda como caché; sin sesión, decidir si hay modo local o se exige cuenta.
- [x] Manejo de sesión expirada: `httpService.setUnauthorizedHandler` y `UserProvider` cierran la sesión ante un 401 con token (sin probar en dispositivo).
- [ ] Tests con Jest (jest-expo) para lo más frágil: cálculo de nivel y logros, y servicios (`utils/*Service.js`) con `fetch` simulado.
- [ ] Añadir ESLint y un script `npm run lint`.
- [ ] Estados de carga y error consistentes en todas las pantallas que llaman a la API (hoy los servicios devuelven `{ success, error }`, falta que la UI los muestre de forma uniforme).
- [ ] Revisar listas largas (historial, registros) contra las reglas de `.agents/skills/vercel-react-native-skills` (FlatList, `memo`, `expo-image`).
- [ ] Actualizar `CONTEXTO_PROYECTO.md` y `MATRIZ_APP_BACKEND.md` al terminar la refactorización.

## Fase 2: Mejorar lo que ya existe (M cada bloque)

Los puntos son hipótesis a validar usando la app en la fase 0.

**Registro de dolor** (`RecordPainScreen`)
- [ ] Registro rápido: persona y tipo de dolor recordados del último uso, deslizador de intensidad 1-10 con valor visible, un solo botón principal.
- [ ] Editar y eliminar registros desde el historial con confirmación y opción de deshacer.
- [ ] Permitir elegir fecha y hora (registrar un dolor de ayer).

**Historial** (`HistoryPeopleScreen`)
- [ ] Filtros por persona, tipo de dolor y rango de fechas; búsqueda en notas.
- [ ] Agrupar por día con encabezados; orden de lectura: persona, tipo de dolor, hora y notas.

**Estadísticas** (`StatsScreen`)
- [ ] Selector semana/mes/año y comparación con el periodo anterior.
- [ ] Gráficos por tipo de dolor y por persona; promedio de intensidad.
- [ ] Estado vacío con ilustración y llamada a la acción.

**Progreso, niveles y logros**
- [ ] Revisar que los logros se desbloqueen solo una vez y se sincronicen con el servidor (hoy se calculan en `UserContext`).
- [ ] Mostrar cuánto falta para el siguiente logro y nivel.

**Personas y tipos de dolor**
- [ ] Validaciones de formulario más claras en español (yup) y mensajes de error de la API traducidos.
- [ ] Avisar qué pasa con los registros al eliminar una persona o un tipo de dolor.

**Perfil y ajustes**
- [ ] Cambio de contraseña y eliminación de cuenta (requiere API).
- [ ] Verificar que recuperar contraseña funciona de extremo a extremo.

## Fase 3: Funcionalidades nuevas (L, priorizar con el dueño)

Ordenadas por valor estimado frente a esfuerzo.

1. [ ] **Recordatorios diarios** con `expo-notifications` (hora configurable): "¿Hubo algún dolor hoy?". Es lo que más retiene en una app de registro diario.
2. [ ] **Compartir** un registro, el resumen semanal o "día sin dolor" con `expo-sharing` (ya instalado) y una imagen generada; sin SDK de Facebook.
3. [ ] **Exportar historial** a CSV o PDF, útil para llevar a una consulta médica.
4. [ ] **Resumen semanal**: tarjeta en Inicio con total, tipo de dolor más frecuente y tendencia.
5. [ ] **Detección de patrones** simple: día de la semana o momento del mes con más registros por persona (ciclo, por ejemplo).
6. [ ] **Etiquetas o desencadenantes** opcionales en cada registro (sueño, estrés, comida, medicación).
7. [ ] **Sección informativa** sobre por qué ocurren ciertos dolores (`InfoScreen` ya existe como base), con aviso de que no sustituye consejo médico.
8. [ ] **Modo sin conexión** con cola de sincronización: crear registros sin red y enviarlos después.
9. [ ] **Mensajes dinámicos en Inicio** según los registros del día, y sorpresa si no hay registros al final del día (del roadmap original).
10. [ ] **Bloqueo con PIN o biometría**, porque son datos de salud.
11. [ ] **Widget o acceso directo** para registrar con un toque (mejora posterior).

## Fase 4: Cambios necesarios en el backend (según fases 2 y 3)

- [ ] Endpoint de logros y puntos persistidos en servidor (hoy se calculan en el cliente).
- [ ] Endpoints de estadísticas agregadas (por rango y por persona) para no calcular todo en el teléfono.
- [ ] Registro de token de notificaciones push.
- [ ] Cambio de contraseña, eliminación de cuenta y exportación.
- [ ] Paginación en `GET /api/records`.
- [ ] Documentar cada cambio en `MATRIZ_APP_BACKEND.md` y probar los contratos snake_case de punta a punta.

## Fase 5: Mejoras de diseño (M–L)

Base: la guía `.github/instructions/dailyaches-ui.instructions.md` (calmado, humano, tarjetas suaves, tokens del tema).

- [ ] **Sistema de diseño ligero**: tokens de espaciado, radios y tipografía en `ThemeContext` y componentes compartidos (`Card`, `SectionHeader`, `EmptyState`, `ListRow`) para que tarjetas similares tengan el mismo padding y radio.
- [ ] **Inicio**: una acción principal clara ("Registrar un dolor"), luego estadísticas del día y después los registros; decidir el rediseño que se revirtió en abril.
- [ ] **Estados vacíos** con una ilustración, un mensaje corto y una llamada a la acción en todas las pantallas.
- [ ] **Modo oscuro**: revisar contraste y colores directos fuera del tema.
- [ ] **Accesibilidad**: áreas táctiles de al menos 44 px, `accessibilityLabel` en iconos, escalado de fuente, contraste AA.
- [ ] **Microinteracciones**: animaciones suaves con Reanimated (ya instalado) al guardar un registro o desbloquear un logro, sin saturar.
- [ ] **Onboarding** de 3 pantallas en el primer uso (crear persona, registrar el primer dolor).
- [ ] **Gráficos**: paleta consistente y legible en claro y oscuro; valorar sustituir `react-native-chart-kit` si limita.
- [ ] **Consistencia de copy**: textos cortos y amables en español; evitar un humor que reste respeto al dominio de salud.
- [ ] **Imágenes**: usar `expo-image` con caché para las ilustraciones y avatares.

## Fase 6: Publicación (M)

- [ ] URL real de la API y variables por entorno (desarrollo, staging y producción).
- [ ] Configurar EAS Build (`eas.json`), identificadores de paquete, versión y permisos en `app.json`.
- [ ] Probar en dispositivo físico Android e iOS.
- [ ] Política de privacidad y aviso de que no es una herramienta médica (necesarios para las tiendas, al tratarse de datos de salud).
- [ ] Reporte de errores (Sentry u otro) y analítica mínima.
- [ ] Beta cerrada (TestFlight / pruebas internas de Google Play) antes de publicar.

## Orden sugerido

1. Fase 0 completa.
2. Fase 1 (divisor de `UserContext`, sesión, tests).
3. Fase 2 y fase 5 en paralelo, pantalla por pantalla, para no tocar dos veces los mismos archivos.
4. Fase 3 con 1 a 4 primero (recordatorios, compartir, exportar, resumen semanal); fase 4 cuando alguna de esas lo requiera.
5. Fase 6 al cerrar la primera versión.

## Bugs detectados

_Hallazgos de la fase 0 (2026-10-22):_

- [ ] `Dailyaches-api` (carpeta hermana `../Dailyaches-api`, Nuxt + PostgreSQL) no responde en `localhost:3000`. Para el smoke test hay que levantarla con `npm run dev:lan` y tener PostgreSQL y su `.env` configurados.
- [x] Resuelto el 2026-10-22: `expo-doctor` pasa 18/18. Se instalaron `react-native-worklets` y `react-native-svg`, se actualizaron `expo` (~54.0.37) y `babel-preset-expo`, se añadió `expo-constants` como dependencia directa y un `overrides` en `package.json` fija `react-native-safe-area-context` en ~5.6.0 (antes `react-native-calendars` anidaba la 4.5.0).
- [x] Quitado el plugin explícito de Reanimated de `babel.config.js` (`babel-preset-expo` lo añade solo si hace falta); las dependencias siguen instaladas.
- [x] `app.json`: `name` pasó a `DailyAches` y `slug` a `dailyaches`. `userInterfaceStyle` se queda en `light` porque el modo oscuro es un interruptor dentro de la app (`ThemeContext`), no sigue al sistema.
- [x] Los ids de la API son strings, pero la app ya los convierte con `String()` en `utils/apiMappers.js`, así que no hay riesgo de comparaciones por tipo.
- [ ] `AuthService.isAuthenticated()` trata cualquier fallo de `/auth/me`, incluido un corte de red, como sesión cerrada; distinguir 401 de errores de red.
