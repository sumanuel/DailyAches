# Arranque rapido: DailyAches

Ultima actualizacion: 2026-06-29

## Requisitos

- Node.js compatible con Expo SDK 54.
- npm.
- Dailyaches-api corriendo si se prueban flujos autenticados o CRUD remoto.

## Variables de entorno y configuracion sensible

Variable detectada del lado app:

- EXPO_PUBLIC_API_URL

Archivo clave:

- constants/api.js

Notas:

- Si EXPO_PUBLIC_API_URL no existe, la app cae a una URL LAN derivada o fija.
- En Android emulador y en dispositivo fisico el comportamiento de fallback cambia.
- La URL de produccion sigue siendo placeholder y debe definirse antes de releases reales.

## Instalacion

```bash
npm install
```

## Desarrollo local

1. levantar Dailyaches-api
2. exportar EXPO_PUBLIC_API_URL si necesitas fijar backend
3. iniciar la app

```bash
npm run start
```

Atajos:

```bash
npm run android
npm run web
```

## Smoke test recomendado

Chequeo manual minimo:

1. registro de usuario
2. login
3. carga de people, pain-types y records
4. creacion de una persona
5. creacion de un tipo de dolor
6. creacion y lectura de un record

## Despliegue

Pasos sugeridos:

1. definir EXPO_PUBLIC_API_URL real para el entorno de release
2. validar flows de auth y CRUD basico
3. generar build Expo/EAS para la plataforma objetivo

## Archivos que conviene leer primero

- CONTEXTO_PROYECTO.md
- MATRIZ_APP_BACKEND.md
- constants/api.js
- context/UserContext.js
