# GitHub release scope

The iOS client is the only part of this repository. Backend source, local environment files, build credentials, reviewer credentials, device logs, screenshots containing account data, and the VocabCat coordination directory do not belong here.

The first GitHub release is free. It must not advertise subscriptions, paid tiers, or AI features. Store submission and physical-device QA are later milestones.

Before distributing an App Store build:

- add the owner-provided icon and splash master files;
- review every tracked file with `git status` and `git diff`;
- run `npm ci`, `npm run release:verify`, and an iOS bundle export;
- confirm that no backend source, credentials, personal logs, or user data are present.

The public source repository uses Apache-2.0 for original code. VocabCat brand
assets remain reserved, and third-party packages and fonts retain their own
licenses.
