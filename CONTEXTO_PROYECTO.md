# Contexto del proyecto: DailyAches

Ultima actualizacion: 2026-06-29

## Resumen rapido

DailyAches es una app Expo/React Native para registrar personas, tipos de dolor, historial y estadisticas. A nivel de implementacion actual ya existe una app funcional con autenticacion, tema, navegacion por tabs y varios modulos CRUD, aunque el roadmap raiz todavia mezcla ideas de producto con una descripcion mas aspiracional que tecnica.

## Stack y arquitectura

- Frontend movil: Expo SDK 54, React 19, React Native 0.81.
- UI base: react-native-paper.
- Formularios: react-hook-form + yup.
- Navegacion: React Navigation con stacks y bottom tabs.
- Estado global: context/UserContext y context/ThemeContext.

## Punto de entrada y flujo base

- App principal: App.js
- Navegacion principal: navigation/AppNavigator.js
- Contextos: context/UserContext.js y context/ThemeContext.js

La app monta ThemeProvider y UserProvider antes del navegador. El AppNavigator decide entre stack de autenticacion y app principal segun isAuthenticated.

## Modulos funcionales principales

- Login, registro y recuperacion.
- Home.
- Personas registradas.
- Registro de dolor.
- Historial por persona.
- Estadisticas.
- Progreso.
- Perfil y configuracion.
- Configuracion de tipos de dolor.

## Navegacion actual

Tabs principales:

- Inicio
- Registro
- Historial
- Mas

Stacks relevantes:

- AuthStack
- HomeStack
- RegistroStack
- StatsStack
- MoreStack

## Pantallas clave

- LoginScreen
- RegisterScreen
- HomeScreen
- PeopleScreen
- RecordPainScreen
- HistoryPeopleScreen
- StatsScreen
- MoreScreen
- ProgressScreen
- SettingsScreen
- PainSettingsScreen

## Carpetas que conviene leer primero

- screens
- navigation
- context
- components

## Comandos utiles

```bash
npm install
npm run start
npm run android
npm run web
```

## Estado actual y notas operativas

- El proyecto ya no esta solo en fase conceptual: la navegacion y las pantallas existen.
- El roadmap.md no debe usarse como unica fuente de verdad porque contiene partes de planificacion antigua y tecnologia sugerida, no siempre reflejo exacto del repo.
- La estructura actual sugiere una app centrada en experiencia local de usuario y temas, con modulos CRUD relativamente claros.

## Riesgos o deuda visible

- Falta documentacion tecnica real del flujo de datos y de la persistencia usada por UserContext.
- El tono funcional del producto requiere cuidado para evitar que el humor degrade la UX o el respeto del dominio.

## Recomendacion para futuras sesiones

Antes de editar:

1. leer App.js
2. leer navigation/AppNavigator.js
3. abrir la pantalla del flujo a tocar
4. revisar el contexto que controla auth o tema si el cambio es transversal
