# Release readiness

Last reviewed: 2026-09-15

Status: **not ready for App Store submission**

This Expo/React Native client brings VocabCat's short daily vocabulary practice to iPhone and iPad. This nested repository is the canonical working copy. Its `origin` now points to `gauravsdama/VocabLearnerIOS`, the same remote used by the older checkouts. The histories have no common commit, so no merge, commit, or push was attempted.

## Verified

- `npm run test:unit` — 5 passed.
- `npm run test:component` — 7 passed.
- `npx tsc --noEmit` — passed.
- `npm audit` and `npm audit --omit=dev` — zero findings after the Expo 57, React Native 0.86, React Navigation 7, and transitive dependency updates.
- `npx expo export --platform ios` — passed; Metro produced the final iOS bundle with 997 modules.
- `npx expo-doctor` — 20 of 21 checks passed. The remaining failure is the missing icon output.
- `npm run screenshots:validate` — failed because the required iPhone 6.9-inch and iPad 13-inch screenshot sets are empty.
- Current dirty changes redact auth-link credentials from logs and narrow Apple-auth response handling; they remain unpublished and need review in the canonical repository.
- Email, Google, and Apple new-account attempts require explicit age and policy acknowledgements and send approved version `2026-09-15`; existing sign-in calls remain unchanged.
- Support reports are text-only. Photo access, screenshot attachment UI, and the associated Expo dependencies were removed.

## Blocking before submission

- Choose how to reconcile the unrelated remote history. Approve a first-party license and add third-party notices/provenance.
- Run the upgraded native dependency set on a simulator and physical devices. Static checks and bundle export pass, but they do not prove native runtime compatibility.
- Configure public Terms and Privacy links before a release so people can read the approved version `2026-09-15` before accepting it.
- Add the existing owner-created icon and splash masters, then generate and track the required outputs. No matching masters were found in the inspected workspace copies.
- Provide required device screenshots. Validate metadata, privacy questionnaire, reviewer notes, support/legal URLs, export compliance, and App Store Connect records.
- Enforce the same age and policy-version acceptance contract as the backend and web client.
- Keep this release free-only; paid access and StoreKit are out of scope.
- Run fresh-install and upgrade tests on physical devices, including Apple/Google/email auth, verification/reset links, offline and poor-network states, notifications, signed writes, logout, account deletion, accessibility, and data-retention checks.
- Pin CI actions, EAS CLI, and build image inputs; run tests, typecheck, dependency checks, screenshot validation, and privacy guards before any build or submit job.

Retain the release commit, resolved remote, lockfile hash, dependency audit, EAS build identifier, signing/notarization evidence, TestFlight device results, store screenshots, and reviewer-flow credentials outside Git.
