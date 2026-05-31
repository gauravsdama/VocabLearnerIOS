# iOS App Store Readiness

This checklist covers the packaging and compliance work needed to prepare the Expo iOS app for TestFlight and App Store review.

## Priority Checklist

| Priority | Task | Status | Acceptance criteria |
| --- | --- | --- | --- |
| Critical | EAS config | Done | `eas.json` has development, preview, production, submit, and metadata profiles. |
| Critical | App identity config | Done | `app.config.ts` reads bundle ID, app version, build number, support URL, and privacy policy URL from environment variables. |
| Critical | Version/build strategy | Done | `cli.appVersionSource` is `remote`; production uses `autoIncrement: "buildNumber"`. |
| Critical | Apple SDK posture | Done | iOS preview and production profiles use EAS image `latest`. |
| High | Icon and splash wiring | Done | `app.config.ts` points to `assets/images/icon.png` and `assets/images/splash-icon.png`; generation script added. |
| High | Screenshot directories | Done | Required screenshot folders exist under `assets/appstore/screenshots/en-US/`. |
| High | Screenshot validation | Done | `npm run screenshots:validate` checks iPhone 6.9 and iPad 13 portrait sizes. |
| High | Privacy/support links | Done | `SUPPORT_URL` and `PRIVACY_POLICY_URL` are required in production and exposed in `extra`. |
| High | Privacy manifest support | Done | `ios.privacyManifests` is configured as a minimal starting point. |
| High | Export compliance default | Done | `ITSAppUsesNonExemptEncryption=false` is set with an in-code warning to change it if non-exempt encryption is used. |
| Medium | Store metadata scaffold | Done | `store.config.js` reads App Store metadata and required URLs from env. |
| Medium | CI workflow | Done | `.github/workflows/ios-build-and-submit.yml` builds and can auto-submit production builds. |
| Manual | App Store Connect setup | Pending | App record, privacy questionnaire, export compliance, screenshots, and reviewer notes are completed in App Store Connect. |
| Manual | TestFlight validation | Pending | Build is uploaded, tester info is configured, and the app works on a fresh install. |

## Required Environment Variables

Set these locally, in EAS environment variables, or in CI variables/secrets. Do not commit secrets.

| Env var | Required for production | Purpose |
| --- | --- | --- |
| `IOS_BUNDLE_IDENTIFIER` | Yes | iOS bundle identifier, for example `com.example.vocabcat`. |
| `APP_VERSION` | Yes | User-facing version, for example `1.0.0`. |
| `IOS_BUILD_NUMBER` | No | Initial iOS build number. EAS production builds auto-increment it remotely. |
| `IOS_SUPPORTS_TABLET` | No | Defaults to `true`; set `false` if this is iPhone-only. |
| `SUPPORT_URL` | Yes | Public support/contact page URL. |
| `PRIVACY_POLICY_URL` | Yes | Public privacy policy URL. |
| `ASC_APP_ID` | Yes for submit | App Store Connect app ID used by `eas submit`. |
| `SPLASH_BACKGROUND_COLOR` | No | Defaults to `#FFFFFF`. |
| `APP_IOS_SCHEME` | No | Defaults to `vocabcat`. |
| `GOOGLE_WEB_CLIENT_ID` | No | Google OAuth web client ID. |
| `GOOGLE_IOS_CLIENT_ID` | No | Google OAuth iOS client ID. |
| `EXPO_PUBLIC_API_BASE_URL` | No | Backend API base URL for the app. |

CI also requires `EXPO_TOKEN`. For App Store Connect credential automation, configure `EXPO_ASC_API_KEY_PATH`, `EXPO_ASC_KEY_ID`, `EXPO_ASC_ISSUER_ID`, `EXPO_APPLE_TEAM_ID`, and `EXPO_APPLE_TEAM_TYPE` as needed.

## Assets

Source artwork goes in:

- `assets/source/icon-master.png`
- `assets/source/splash-master.png`
- Optional: `assets/source/splash-master-dark.png`

Generated Expo assets:

- `assets/images/icon.png`: 1024x1024 PNG, square, fully filled, no rounded corners.
- `assets/images/splash-icon.png`: 1024x1024 PNG.
- `assets/images/splash-icon-dark.png`: optional dark splash PNG.

Generate assets:

```sh
npm run assets:generate
```

Optional ImageMagick equivalents:

```sh
magick assets/source/icon-master.png -resize 1024x1024^ -gravity center -extent 1024x1024 -alpha remove assets/images/icon.png
magick assets/source/splash-master.png -resize 1024x1024 -background none -gravity center -extent 1024x1024 assets/images/splash-icon.png
```

## Screenshots

Required screenshot folders:

- iPhone 6.9 portrait: `assets/appstore/screenshots/en-US/iphone-6.9/`
- iPad 13 portrait: `assets/appstore/screenshots/en-US/ipad-13/`

Exact sizes:

| Device class | Portrait size |
| --- | --- |
| iPhone 6.9-inch | 1290x2796 |
| iPad 13-inch | 2064x2752 |

Validate screenshots:

```sh
npm run screenshots:validate
```

If `IOS_SUPPORTS_TABLET=false`, iPad screenshots may not be required by App Store Connect. Keep the iPad folder available in case tablet support is re-enabled.

## Store Metadata

`store.config.js` reads the following optional metadata env vars:

- `APP_STORE_TITLE`
- `APP_STORE_SUBTITLE`
- `APP_STORE_KEYWORDS`
- `APP_STORE_DESCRIPTION`
- `APP_STORE_RELEASE_NOTES`
- `APP_STORE_PRIMARY_CATEGORY`
- `APP_STORE_SECONDARY_CATEGORY`

Default metadata is intentionally conservative and should be reviewed before submission.

## Support And Privacy Templates

Support page should include:

```text
Contact: support@example.com
Product: vocabcat
Response window: We usually respond within 2 business days.
Account help: Include the email address associated with your account.
```

Privacy policy placement:

```text
Privacy Policy: https://example.com/privacy
In-app location: Settings > Privacy policy
User data controls: Settings > Delete account
```

Export compliance notes:

```text
The app uses HTTPS/TLS through operating system networking APIs.
No custom or non-exempt encryption is implemented.
If a future SDK or app feature adds non-exempt cryptography, update ITSAppUsesNonExemptEncryption and App Store Connect export compliance before submission.
```

Reviewer notes template:

```text
Demo account email: reviewer@example.com
Demo account password: <set before submission>
Primary flow: Sign in, complete onboarding if prompted, open the feed, answer a quiz, open Settings.
Support URL: <SUPPORT_URL>
Privacy Policy URL: <PRIVACY_POLICY_URL>
Notes: No special hardware is required.
```

## App Store Connect Steps

1. Create the app record and select the final bundle ID. Bundle ID cannot be changed after build upload.
2. Set SKU, app name, primary language, category, support URL, and privacy policy URL.
3. Fill version metadata: subtitle, description, keywords, promotional text, release notes.
4. Upload iPhone 6.9 screenshots. Upload iPad 13 screenshots if the app supports iPad.
5. Complete App Privacy details accurately for collected data and tracking.
6. Complete export compliance and upload documentation if Apple requires it.
7. Run a production EAS build.
8. Submit the build with EAS Submit or App Store Connect upload flow.
9. Select the build for the app version.
10. Fill App Review Information, including demo credentials and reviewer notes.
11. Submit for review once every required field is green.

## TestFlight Steps

1. Upload a production build.
2. Complete export compliance if App Store Connect asks before processing.
3. Fill TestFlight test information.
4. Create internal and external tester groups.
5. Invite testers.
6. Run a fresh-install QA pass from TestFlight.
7. Verify icon, splash, login, registration, feed, settings, support/privacy links, and account deletion.

## Local Commands

```sh
npm ci
npm run assets:generate
npm run screenshots:validate
eas login
eas build --platform ios --profile preview
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

Equivalent npm scripts:

```sh
npm run ios:build:preview
npm run ios:build:prod
npm run ios:submit
```

## CI Notes

The workflow at `.github/workflows/ios-build-and-submit.yml` runs:

```sh
npm ci
npm run assets:generate
eas build --platform ios --profile production --non-interactive
```

When the workflow input `submit=true`, it runs:

```sh
eas build --platform ios --profile production --non-interactive --auto-submit
```

The workflow skips asset generation when source artwork is absent, so CI can still validate the EAS setup before final artwork is committed.
