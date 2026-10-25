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

- [x] Partir `context/UserContext.js` (hecho 2026-10-23, 997 a 286 líneas): `utils/gamification.js` y `utils/apiMappers.js` (funciones puras), `context/AuthContext.js` (sesión y handler de 401) y `context/useRemoteData.js` (API de personas, tipos de dolor y registros). `useUser()` sigue siendo la fachada, así que las pantallas no cambiaron. Probado en la versión web contra la API local: login, persistencia tras recargar y cierre de sesión por token inválido. No probado en dispositivo ni crear/editar/borrar datos desde la UI.
- [ ] Definir una sola fuente de verdad: con sesión manda la API y AsyncStorage queda como caché; sin sesión, decidir si hay modo local o se exige cuenta.
- [x] Manejo de sesión expirada: `httpService.setUnauthorizedHandler` y `UserProvider` cierran la sesión ante un 401 con token (sin probar en dispositivo).
- [x] Jest (jest-expo) instalado (2026-10-23): 24 pruebas para `gamification`, `apiMappers` y `httpService` (`npm test`). Pendiente: pruebas de `utils/*Service.js` y de los contextos (hace falta `@testing-library/react-native`).
- [x] ESLint con `eslint-config-expo` y `npm run lint` (0 errores, 0 avisos desde 2026-10-23). Para ello los cargadores de `useRemoteData` y `getTodayRecords` ahora son estables con `useCallback`.
- [x] Estados de carga y error (2026-10-23): `useRemoteData` guarda `{ loading, loaded, error }` por recurso (`remoteStatus` en `useUser()`) y el componente `LoadStatusNotice` muestra un indicador de carga o un aviso con `Reintentar` en Inicio, Personas, Historial, Configurar dolores, Registro y Estadísticas. Probado en web con la API apagada y encendida; no revisado visualmente ni en dispositivo. Quedan fuera los errores al guardar (crear/editar/borrar), que cada pantalla sigue manejando por su cuenta.
- [x] Listas largas revisadas (2026-10-23): Personas y la lista de personas del Historial pasaron de `ScrollView` + `map` a `FlatList`; los registros de Estadísticas se muestran de 30 en 30 con `Ver más registros`; las listas de tipos de dolor usan el id como clave. Probado en web con 35 registros. Pendiente: `Inicio` monta todos los registros del día agrupados por persona (aceptable con pocos al día); los `FlatList` de Logros y Progreso tienen `scrollEnabled={false}` dentro de un `ScrollView` (12 elementos, sin virtualizar); `renderItem` de personas y dolores no está memoizado porque los manejadores (`openEdit`, `removePerson`…) se recrean en cada render.
- [ ] Actualizar `CONTEXTO_PROYECTO.md` y `MATRIZ_APP_BACKEND.md` al terminar la refactorización.

## Fase 2: Mejorar lo que ya existe (M cada bloque)

Los puntos son hipótesis a validar usando la app en la fase 0.

**Registro de dolor** (`RecordPainScreen`)
- [x] Registro rápido (2026-10-24): el tipo de dolor del último registro de esa persona llega preseleccionado y la intensidad 1-10 se elige con `PainLevelPicker` (antes se guardaba siempre 5, y no se mostraba en ninguna parte). La intensidad aparece ahora en Inicio y en Estadísticas. Probado en web contra la API local; no en dispositivo.
- [x] Editar y eliminar registros desde Inicio y desde el Historial de cada persona (2026-10-24). Eliminar oculta el registro al instante y muestra "Registro eliminado · Deshacer" durante 6 s; pasado ese tiempo se borra en la API (si el servidor falla, el registro vuelve y se avisa). Sustituye al diálogo de confirmación porque deshacer es menos intrusivo y funciona también en web. Si se cierra la app durante esos 6 s el registro no se borra. Probado en web contra la API local; no en dispositivo.
- [ ] Permitir elegir fecha y hora (registrar un dolor de ayer). Bloqueado por la API: `POST /api/records` no acepta `created_at` (ver fase 4).

**Historial** (`HistoryPeopleScreen`)
- [x] Filtros del historial por persona (se elige antes), rango de fechas (ya existía), tipo de dolor (chips con conteo) y búsqueda en notas y nombre del dolor, sin distinguir mayúsculas ni acentos (2026-10-24). Lógica en `utils/recordFilters.js` con 13 pruebas. Probado en web.
- [x] Registros agrupados por día con encabezados "Hoy", "Ayer" o "mar 20 oct 2026" y su conteo, en la pestaña Histórico. La agrupación en varios días solo está probada con pruebas unitarias: la API no permite crear registros con otra fecha.

**Estadísticas** (`StatsScreen`)
- [x] Pantalla Estadísticas (Más > Estadísticas, 2026-10-24) con selector semana/mes/año, navegación entre periodos y comparación con el periodo anterior (registros e intensidad media). Lógica en `utils/periodStats.js` con 16 pruebas. Probado en web con datos de prueba; la comparación entre periodos solo con pruebas unitarias, porque la API no permite fechas pasadas.
- [x] Gráficos de columnas (por día o por mes), barras por tipo de dolor y por persona, e intensidad media, dibujados con vistas (`components/BarCharts.js`) sin librería; `react-native-chart-kit` y `react-native-svg` siguen instalados pero sin usarse. Se pueden quitar o usar para gráficos más complejos.
- [ ] Estado vacío con ilustración y llamada a la acción.

**Progreso, niveles y logros**
- [x] Logros (2026-10-24): se desbloquean una sola vez (probado con pruebas); el progreso se reconstruye con los registros del servidor al iniciar sesión (`reconcileProgress`), de modo que un dispositivo nuevo o registros anteriores también cuentan; y el progreso local se guarda por usuario (`userData:<id>`), con migración única de la clave antigua. Antes dos cuentas en el mismo dispositivo compartían puntos y logros. Los logros siguen calculándose en el cliente: la API no los guarda (fase 4).
- [x] Progreso visible: tarjeta «Próximo logro» y, en cada logro bloqueado, barra y texto («12 de 20 registros», «295 de 395 pts»); contador «6 de 12 desbloqueados». Probado en web.

**Personas y tipos de dolor**
- [x] Validaciones y errores en español (2026-10-24): `utils/apiErrors.js` traduce los mensajes de la API (el original queda en `rawError`), `utils/validation.js` valida nombre, teléfono y fecha de nacimiento, y los formularios de Acceso, Registro, Persona, Dolor y Perfil muestran el error junto al campo o bajo el formulario (antes eran `Alert`, que no se ven en web). Con 20 pruebas nuevas y probado en web.
- [x] Avisos al eliminar (2026-10-24): al eliminar una persona con registros se dice cuántos tiene y que se borrarán con ella («Eliminar todo»); al eliminar un tipo de dolor que se usa se explica en cuántos registros y no se intenta. Hallazgo: la API devolvía un error 500 al borrar una persona con registros (clave foránea sin cascada en la tabla `records`), así que antes esa persona no se podía eliminar; ahora la app borra primero sus registros y después a la persona. Probado en web contra la API local.

**Perfil y ajustes**
- [ ] Cambio de contraseña y eliminación de cuenta (requiere API).
- [ ] Verificar que recuperar contraseña funciona de extremo a extremo.

## Fase 3: Funcionalidades nuevas (L, priorizar con el dueño)

Ordenadas por valor estimado frente a esfuerzo.

1. [x] **Recordatorios diarios** (2026-10-24): `Más > Configuración > Recordatorio diario`, con interruptor y hora (por defecto 20:00); notificación local diaria «¿Hubo algún dolor hoy?» con `expo-notifications`. Lógica en `utils/reminders.js` y `utils/reminderService.js` (14 pruebas con el módulo simulado). Pendiente de probar en un móvil real: no se pudo verificar que la notificación llegue; en web el interruptor sale desactivado. Es una notificación diaria fija: no se omite si ya hubo registros ese día, y se pierde al reinstalar hasta volver a activarla.
2. [ ] **Compartir** un registro, el resumen semanal o "día sin dolor" con una imagen generada; sin SDK de Facebook. Hecho (texto): el resumen semanal y cada registro se comparten como texto con la hoja del sistema. Pendiente: la imagen (hace falta capturar una vista, p. ej. `react-native-view-shot`) y el mensaje de «día sin dolor».
3. [x] **Exportar historial** a CSV o PDF (2026-10-24): `Más > Exportar historial`, con persona, periodo (este mes, mes anterior, este año, todo) y formato. `utils/exportRecords.js` crea el CSV (con BOM para Excel, comillas escapadas y celdas que empiezan por `=`, `+`, `-` o `@` neutralizadas) y el informe HTML para el PDF (`expo-print`); `utils/exportService.js` escribe el archivo y lo comparte (`expo-file-system`, `expo-sharing`). 28 pruebas con los módulos simulados. En web se descarga el CSV (probado) y el PDF queda desactivado; en el móvil, la hoja de compartir y el PDF no están probados en un dispositivo real.
4. [x] **Resumen semanal** (2026-10-24): tarjeta «Tu semana» en Inicio (lunes a domingo) con registros, comparación con la semana anterior, intensidad media, días con dolor y dolor más frecuente; botón para ver las estadísticas y otro para compartirla como texto, sin nombres ni notas, que cuenta para el logro «Compartidor». `getWeeklyHighlights` y `buildWeeklyShareText` en `utils/periodStats.js`, con pruebas. Probado en web.
5. [x] **Detección de patrones** (2026-10-24): tarjeta «Patrones» en Estadísticas con el día de la semana, el momento del día (madrugada, mañana, tarde, noche) y el dolor que más destacan en el periodo y persona elegidos. Solo aparece un patrón con al menos 6 registros y cuando una opción concentra una parte clara (40 % para el día, 50 % para el momento y el dolor) y no hay empate; se redacta como observación, con el aviso de que no es un diagnóstico. `utils/patterns.js` con 9 pruebas; probado en web. Queda fuera el «momento del mes» (necesitaría saber el ciclo de cada persona).
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
- [ ] `LoginScreen` llama a `navigation.getParent()?.replace("Main")` tras el login y React Navigation avisa de que ninguna pantalla `Main` lo maneja; el cambio de pantalla ya lo hace `isAuthenticated`, así que esa línea sobra.
- [ ] `RegisterScreen` usa `AuthService.register` directo: guarda el token pero no activa `isAuthenticated`; después pide iniciar sesión. Decidir si debe entrar directo con `register` del contexto.
- [ ] Aviso de React en web: un input pasa de no controlado a controlado (algún formulario inicia con `undefined`).
- [ ] `MoreScreen` confirma el cierre de sesión con `Alert.alert`, que no hace nada en react-native-web; solo funciona en móvil.
- [x] `httpService` no cancelaba el temporizador de timeout cuando `fetch` fallaba; ahora lo limpia en un `finally` (lo detectó Jest como proceso sin cerrar).
- [x] `@expo/vector-icons` y `expo-font` se usaban sin estar declarados; ahora son dependencias directas y `expo-doctor` pasa 18/18.
- [x] `RecordPainScreen` mostraba "¡Registrado!" aunque la API rechazara el registro (los servicios devuelven `{ success: false }` sin lanzar); ahora comprueba el resultado, muestra el error y no sale de la pantalla.
- [x] `RecordPainScreen` leía `painTypes` y `setValue` en un efecto declarado antes que ellos; reordenado.
- [ ] Los filtros del Historial no se pueden usar sin elegir antes una persona; valorar una vista global (todas las personas) y los presets "este año" y "todo".
- [x] Inicio borraba registros solo en local (`deleteRecord`): el registro seguía en el servidor y reaparecía al recargar. Ahora todos los borrados pasan por la API (`scheduleDeleteRecord`).
- [ ] Al borrar un registro no se restan los puntos que dio (los logros ya desbloqueados tampoco se revierten); decidir si es lo deseado.
- [x] Compartir un registro desbloqueaba el logro 5 («Veinte al Archivo») en lugar del 12 («Compartidor»), porque los ids cambiaron; ahora usa `SHARE_ACHIEVEMENT_ID`.
- [ ] `AchievementsScreen` y `LevelScreen` no están en ninguna ruta; revisar si se eliminan.
- [ ] Al migrar la clave antigua `userData`, el primer usuario que inicie sesión en el dispositivo se queda con ese progreso (no hay forma de saber de quién era).
- [x] Guardar una persona, un tipo de dolor o el perfil cerraba la pantalla aunque la API fallara (o, en el perfil, decía "actualizados" tras guardar solo en local). Ahora esas acciones devuelven `{ success, error }`, no cierran si falla y muestran el motivo. Eliminar una persona o un tipo de dolor tampoco los quita ya de la lista local si el servidor lo rechaza.
- [x] Con la fecha de nacimiento, la API devuelve un timestamp ISO; ahora se muestra solo la parte AAAA-MM-DD (`toDateInput`). Se puede vaciar teléfono y fecha (antes se quedaba el valor anterior).
- [x] En web, un fallo de red salía como "Failed to fetch"; ahora es "Error de conexión. Verifica tu conexión a internet.". Ningún mensaje de excepción en inglés llega ya al usuario.
- [ ] Probar el recordatorio en un dispositivo (permiso, hora exacta, Android 13+ y iOS) antes de darlo por bueno; en Expo Go para Android las notificaciones remotas no existen pero las locales deberían funcionar.
- [ ] Backend (fase 4): poner `ON DELETE CASCADE` en `records.person_id` (o un endpoint que borre persona y registros en una sola transacción). Hoy, si falla a mitad, la persona queda sin parte de sus registros; la app lo avisa y recarga.
- [x] Los diálogos de confirmación y aviso usan `utils/confirm.js`, que en web recurre a `window.confirm`/`alert` (`Alert.alert` no hace nada en react-native-web).
- [ ] Probar en un móvil real la exportación: que `Sharing.shareAsync` abra la hoja de compartir con el CSV y el PDF, y que el PDF se vea bien (saltos de página en historiales largos).
- [ ] Los datos exportados son de salud: no hay aviso de privacidad antes de compartirlos; valorar un texto breve en la pantalla.
