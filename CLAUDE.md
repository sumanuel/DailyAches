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
npm test                              # Jest (jest-expo preset), tests live in utils/__tests__
npx jest utils/__tests__/gamification.test.js   # a single test file
npm run lint                          # ESLint (eslint-config-expo), currently clean
npx expo-doctor                       # should pass 18/18
```

Tests cover only the pure logic and `httpService` (`gamification`, `apiMappers`, `httpService`); contexts, services and screens are verified manually (smoke test in `ARRANQUE_RAPIDO.md`: register, login, load people/pain-types/records, create each). `npx expo start --web` with `EXPO_PUBLIC_API_URL` pointing at a local `Dailyaches-api` is a quick way to exercise login and the data flow in a browser; `Alert.alert` does nothing on web.

Backend URL: set `EXPO_PUBLIC_API_URL` (the `/api` suffix is appended if missing). Copy `.env.example` to `.env` (git-ignored). Without the variable, `constants/api.js` uses `10.0.2.2:3000` on Android emulators and the Expo host elsewhere (set the variable explicitly on physical devices if the host is a virtual adapter). The production URL is still a placeholder.

## Architecture

- **Entry/providers**: `App.js` nests `ThemeProvider` > `AuthProvider` > `UserProvider` > `PaperProvider` (react-native-paper, themed from `ThemeContext`) > `AppNavigator`.
- **Navigation** (`navigation/AppNavigator.js`): switches between an auth stack and the main app on `isAuthenticated` from `UserContext`. Main app is bottom tabs (Inicio, Registro, Historial, Más), each with its own native stack.
- **State is split in three layers, exposed through one `useUser()` facade**: `context/AuthContext.js` owns only the session (`isAuthenticated`, `authLoading`, login/register/logout) and the 401 handler that logs out on an expired token. `context/UserContext.js` holds the single `user` state (points, level, achievements, profile, people, painTypes, records), persists it to AsyncStorage key `userData`, and hydrates it whenever the session changes (remote data when logged in, local data otherwise, reset after logout). `context/useRemoteData.js` is a hook, not a provider: people/pain-type/record API calls and their matching `user` updates, sharing `UserProvider`'s state. Screens keep using `useUser()` for everything. Each list load records `{ loading, loaded, error }` per resource in `remoteStatus` (see `utils/loadStatus.js`); `components/LoadStatusNotice.js` renders the spinner / retry card from it. Changes to API response shapes tend to degrade this silently.
- **Pure logic**: `utils/gamification.js` (levels, achievements, automatic unlock rules, defaults) and `utils/apiMappers.js` (snake_case API payloads to app state, ids converted to strings) have no React or network dependencies.
- **Services** (`utils/*Service.js`) wrap the API per resource (auth, people, painTypes, records) on top of `utils/httpService.js`, a singleton fetch wrapper that returns `{ success, data|error, status }` rather than throwing, injects the Bearer token (in-memory, falling back to AsyncStorage `authToken`), applies a timeout, and calls the handler set by `setUnauthorizedHandler` on a 401 made with a token. Endpoint paths are in `constants/api.js`.
- **API contract**: payloads use snake_case (`image_url`, `whatsapp_enabled`, `person_id`, `pain_type_id`, `pain_level` 1–10); `/records` responses include enriched `person_name`, `pain_type_name`, `pain_type_image`. Renaming any of these breaks at runtime with no compile error. Field-by-field table in `MATRIZ_APP_BACKEND.md`; update it together with `constants/api.js` when the contract changes.
- **UI building blocks**: `components/` (`AppScreen`, `AppTextField`, `HeroPanel`, `IllustrationBadge`) and `constants/illustrations.js`. Forms use react-hook-form + yup.

## UI conventions

`.github/instructions/dailyaches-ui.instructions.md` applies to `screens/`, `components/`, `navigation/` and `ThemeContext`: calm, humane health-app tone; use theme tokens rather than hard-coded colors; rounded soft cards; one primary action per screen; intentional empty states (illustration + short message + CTA); short friendly Spanish copy; consistent card padding/radius.

`.agents/skills/vercel-react-native-skills/` holds installed React Native best-practice rules (list performance, expo-image, native navigators, etc.), pinned in `skills-lock.json`.
