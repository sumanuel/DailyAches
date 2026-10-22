# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DailyAches: Expo SDK 54 / React Native 0.81 / React 19 app (plain JavaScript, no TypeScript) for logging people, pain types, pain records, progress and stats. UI copy is in Spanish. It talks to a separate backend, `Dailyaches-api` (not in this repo). Existing docs worth reading before cross-cutting changes: `CONTEXTO_PROYECTO.md`, `ARRANQUE_RAPIDO.md`, `MATRIZ_APP_BACKEND.md`. `roadmap.md` is old aspirational planning, not a source of truth.

## Commands

```bash
npm install
npm run start     # expo start
npm run android
npm run ios
npm run web
```

There is no test runner, linter or build script configured. Verification is manual (smoke test in `ARRANQUE_RAPIDO.md`: register, login, load people/pain-types/records, create each).

Backend URL: set `EXPO_PUBLIC_API_URL` (the `/api` suffix is appended if missing). Without it, `constants/api.js` falls back to a hardcoded LAN IP (`192.168.1.10:3000`) on Android emulators/physical devices, or the Expo host on web/iOS sim. The production URL is still a placeholder.

## Architecture

- **Entry/providers**: `App.js` nests `ThemeProvider` > `UserProvider` > `PaperProvider` (react-native-paper, themed from `ThemeContext`) > `AppNavigator`.
- **Navigation** (`navigation/AppNavigator.js`): switches between an auth stack and the main app on `isAuthenticated` from `UserContext`. Main app is bottom tabs (Inicio, Registro, Historial, Más), each with its own native stack.
- **`context/UserContext.js`** (~1000 lines) is the heart of the app: it holds the whole user state (points, level, achievements, profile, people, painTypes, records) and all mutations. Gamification (achievement definitions, level computation, automatic unlocks on record count) lives here too. It is a hybrid local/remote store: on startup, if a token exists it loads from the API (`/auth/me`, then people/pain-types/records), otherwise it hydrates from AsyncStorage key `userData`. Changes to API response shapes tend to degrade this silently.
- **Services** (`utils/*Service.js`) wrap the API per resource (auth, people, painTypes, records) on top of `utils/httpService.js`, a singleton fetch wrapper that returns `{ success, data|error, status }` rather than throwing, injects the Bearer token (in-memory, falling back to AsyncStorage `authToken`), and applies a timeout. Endpoint paths are in `constants/api.js`.
- **API contract**: payloads use snake_case (`image_url`, `whatsapp_enabled`, `person_id`, `pain_type_id`, `pain_level` 1–10); `/records` responses include enriched `person_name`, `pain_type_name`, `pain_type_image`. Renaming any of these breaks at runtime with no compile error. Field-by-field table in `MATRIZ_APP_BACKEND.md`; update it together with `constants/api.js` when the contract changes.
- **UI building blocks**: `components/` (`AppScreen`, `AppTextField`, `HeroPanel`, `IllustrationBadge`) and `constants/illustrations.js`. Forms use react-hook-form + yup.

## UI conventions

`.github/instructions/dailyaches-ui.instructions.md` applies to `screens/`, `components/`, `navigation/` and `ThemeContext`: calm, humane health-app tone; use theme tokens rather than hard-coded colors; rounded soft cards; one primary action per screen; intentional empty states (illustration + short message + CTA); short friendly Spanish copy; consistent card padding/radius.

`.agents/skills/vercel-react-native-skills/` holds installed React Native best-practice rules (list performance, expo-image, native navigators, etc.), pinned in `skills-lock.json`.
