# VocabCat (iOS)

## Setup

1. Install the locked dependencies (Node 22 is the CI baseline):

```bash
npm ci
```

2. Copy `.env.example` to `.env.local` and configure local values as needed:

```bash
EXPO_PUBLIC_API_BASE_URL=https://vocab-backend-219277558905.us-central1.run.app
APP_IOS_SCHEME=vocabcat
GOOGLE_WEB_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

For the full auth setup and provider-console steps, see `AUTH_SETUP_GUIDE.md`.

Local env policy:

- Keep local values in uncommitted `.env.local` or `.env.production.local`.
- Keep production values in shell/EAS environment configuration, not committed env files.

3. Start Expo:

```bash
npx expo start
```

If you run into stale env/config issues, clear Metro cache:

```bash
npx expo start -c
```

## Run on iOS Simulator

- Ensure Xcode + iOS Simulator are installed.
- Run:

```bash
npx expo start --ios
```

## Run on Physical iPhone (Expo Go)

Plain Expo Go is fine for basic UI work, but Google Sign-In and Apple Sign-In require native modules. Use `npx expo run:ios` or a dev build when testing auth.

1. Install **Expo Go** from the App Store.
2. Run:

```bash
npx expo start
```

3. Scan the QR code with your iPhone camera (or Expo Go).

## Networking Notes

- Cloud Run (recommended, works everywhere): `EXPO_PUBLIC_API_BASE_URL=https://vocab-backend-219277558905.us-central1.run.app`
- Local backend:
  - Simulator can often use `http://localhost:8000` (Expo Go), but production iOS builds typically require HTTPS unless you add ATS exceptions.
  - Physical iPhone must use your Mac LAN IP, e.g. `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:8000`.

## Verify Connectivity

Backend health check:

```bash
curl -i https://vocab-backend-219277558905.us-central1.run.app/health
```

In-app health check (no new UI screens):

- Enable Diagnostics screen: `EXPO_PUBLIC_TRACE_UI=true`
- Open the app → Home → Diagnostics
- Tap **API Ping** and check for `IOS_API_PING_OK` / `IOS_API_PING_FAIL` in:
  - Metro terminal logs
  - Diagnostics screen log list (Client Logs)

## Logging Notes

- Client logs are written to Metro/device logs with stable `FE_LOG_ID` tags.
- Set `EXPO_PUBLIC_TRACE_UI=true` to enable the in-app Diagnostics screen (dev only).
- Run `npm run release:verify` before sharing a build or publishing a branch.

## Notes

- All API calls use the `EXPO_PUBLIC_API_BASE_URL` and `/api/v1`.
- `EXPO_PUBLIC_API_BASE_URL` should be the backend origin (no `/api/v1`), e.g. `https://…run.app` or `http://192.168.x.x:8000`.
- Auth screens now include login, register, forgot password, reset password, email verification pending, and verify email.
- Auth tokens are stored in Expo SecureStore.

## Stats Page API (All Words / Manual Downgrade / Question History)

Base: `{EXPO_PUBLIC_API_BASE_URL}/api/v1`

- Snapshot cards: `GET /stats/summary`
- Words list (All Time): `GET /study/progress/list?status=all&page=1&page_size=50`
- Words list (search/sort/assigned): `GET /study/progress/list?status=all&q=aloof&assigned=only&assigned_first=true&sort=highest_mastery&page=1&page_size=50`
- Words list (filtered): `GET /study/progress/list?status=learning` (or `reviewing|mastered|new`)
- Manual downgrade (re-show in feed): `POST /study/progress/{word_id}/downgrade`
- Question history for a word: `GET /study/progress/{word_id}/quiz-attempts?page=1&page_size=20`

Important: don’t use `/stats/words` (it’s not part of the intended API). If the UI shows “This Week” vs “All Time”, “This Week” should be disabled for now or mapped to the same `/study/progress/list` call until a real week-scoped endpoint exists.

## License

The original source code is available under Apache-2.0. The VocabCat name and
brand artwork remain reserved. See `LICENSE`, `NOTICE`, `ASSET_LICENSE.md`, and
`THIRD_PARTY_NOTICES.md`.
