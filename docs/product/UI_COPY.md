# VocabCat iOS UI copy inventory

Human editorial source of truth for native-app copy. The first table preserves earlier review notes and does not authorize wording changes. The verified source table inventories implemented visible, status, error, metadata, tooltip, and accessibility wording exactly. Age, Terms, and Privacy consent version `2026-09-15` is approved.

| ID | Screen / state | Current text | Purpose / user intent | Earlier review note—not implemented | Status | Implementation location | Notes |
|---|---|---|---|---|---|---|---|
| `ios.auth.register` | Register | Create Account / Creating… | Create a learner account | Create account / Creating account… | inventory | `app/screens/RegisterScreen.tsx` | Sentence case; announce errors and completion. |
| `ios.auth.display-name` | Register | Display name / What should we call you? | Collect preferred name | Name / What should VocabCat call you? | inventory | `RegisterScreen.tsx` | Clarify public/private use if applicable. |
| `ios.auth.provider` | Register/login | Continue with Google / Connecting Google… | Federated login | Continue with Google / Connecting to Google… | inventory | `RegisterScreen.tsx`, `LoginScreen.tsx` | Cancellation is not an error. |
| `ios.auth.age-confirmation` | Register | I confirm that I am at least 13 years old. | Confirm minimum age | Keep approved | approved-2026-09-15 | `app/screens/RegisterScreen.tsx` | Required for email, Google, and Apple new-account attempts. |
| `ios.auth.policy-acceptance` | Register | I agree to the Terms of Use and Privacy Policy. | Record policy acceptance | Keep approved | approved-2026-09-15 | `app/screens/RegisterScreen.tsx` | Approved Terms and Privacy version: 2026-09-15. Public policy URLs must be configured before release. |
| `ios.auth.policy-required` | Register | Confirm your age and accept the Terms of Use and Privacy Policy first. | Explain blocked registration | Keep approved | approved-2026-09-15 | `app/screens/RegisterScreen.tsx` | Applies to email, Google, and Apple new-account attempts. |
| `ios.auth.verify` | Verify email | Send email verification code / Verify code / Your email is now verified. | Complete account verification | Keep, sentence case | inventory | `EmailVerificationPendingScreen.tsx` | Use an accessible one-time-code field. |
| `ios.feed.error` | Feed | Unable to load feed. | Recover from request failure | Couldn’t load your learning feed. Check your connection and try again. | inventory | `app/screens/FeedScreen.tsx` | Add a visible retry action. |
| `ios.feed.limit` | Feed | Daily limit reached. Pull to refresh later. | Explain no more content | You’ve reached today’s limit. Come back tomorrow or review your saved words. | needs-owner-answer | `FeedScreen.tsx` | Backend message may override; centralize policy wording. |
| `ios.sentence.input` | Feed card | Type your sentence | Invite practice | Write a sentence using this word | inventory | `app/feed/SentenceCard.tsx` | Add accessible name and error association. |
| `ios.settings.success` | Settings | Preferences updated. | Confirm save | Preferences saved. | inventory | `app/screens/SettingsScreen.tsx` | Announce without moving focus. |
| `ios.settings.error` | Settings | Unable to save settings. | Recover from failure | Couldn’t save your preferences. Try again. | inventory | `SettingsScreen.tsx` | Preserve unsaved input. |
| `ios.diagnostics` | Development only | API Ping / Copy / Copied | Test local/backend setup | Keep out of production navigation | inventory | `app/screens/DiagnosticsScreen.tsx` | Copy must not leak tokens, user data, or internal URLs. |
| `ios.settings.support-intro` | Settings / support | Send an issue directly to support. | Explain the support form | Keep | owner-directed | `app/screens/SettingsScreen.tsx` | Screenshot attachment was removed; the client submits text fields only. |

## Coverage status

The verified source table below covers current React Native source. `npm run copy:inventory:check` fails when implemented strings drift from this reviewed snapshot. Native-device behavior still requires the separately deferred QA pass.

<!-- BEGIN VERIFIED SOURCE COPY -->

This table is a source-extracted snapshot of current wording. Review changes; do not rewrite it automatically.

| Stable ID | Source | Kind | Exact current text |
|---|---|---|---|
| `ios.app.components.wordprogressmodal.001` | `app/components/WordProgressModal.tsx:174` | text | Assigned |
| `ios.app.components.wordprogressmodal.002` | `app/components/WordProgressModal.tsx:180` | text | ${item.status} • seen ${item.seen_count}${item.next_due_at ? \` • due ${formatDateTime(item.next_due_at)}\` : ""} |
| `ios.app.components.wordprogressmodal.003` | `app/components/WordProgressModal.tsx:185` | attr-label | Close |
| `ios.app.components.wordprogressmodal.004` | `app/components/WordProgressModal.tsx:192` | text | Actions |
| `ios.app.components.wordprogressmodal.005` | `app/components/WordProgressModal.tsx:194` | text | Downgrading resets the word to unlearned so it reappears in the feed. |
| `ios.app.components.wordprogressmodal.006` | `app/components/WordProgressModal.tsx:198` | attr-label | Downgrading... |
| `ios.app.components.wordprogressmodal.007` | `app/components/WordProgressModal.tsx:198` | attr-label | Downgrade to unlearned |
| `ios.app.components.wordprogressmodal.008` | `app/components/WordProgressModal.tsx:206` | attr-label | Hide questions |
| `ios.app.components.wordprogressmodal.009` | `app/components/WordProgressModal.tsx:206` | attr-label | Questions |
| `ios.app.components.wordprogressmodal.010` | `app/components/WordProgressModal.tsx:217` | text | Question history |
| `ios.app.components.wordprogressmodal.011` | `app/components/WordProgressModal.tsx:219` | text | ${attempts.length} of ${attemptsTotal} |
| `ios.app.components.wordprogressmodal.012` | `app/components/WordProgressModal.tsx:228` | text | No quiz attempts yet. |
| `ios.app.components.wordprogressmodal.013` | `app/components/WordProgressModal.tsx:241` | text | Correct |
| `ios.app.components.wordprogressmodal.014` | `app/components/WordProgressModal.tsx:241` | text | Incorrect |
| `ios.app.components.wordprogressmodal.015` | `app/components/WordProgressModal.tsx:266` | attr-label | Loading... |
| `ios.app.components.wordprogressmodal.016` | `app/components/WordProgressModal.tsx:266` | attr-label | Load more |
| `ios.app.feed.endcard.001` | `app/feed/EndCard.tsx:11` | text | You are all caught up |
| `ios.app.feed.feedcard.001` | `app/feed/FeedCard.tsx:32` | attr-label | Skip |
| `ios.app.feed.quizcard.001` | `app/feed/QuizCard.tsx:24` | attr-label | Question |
| `ios.app.feed.quizcard.002` | `app/feed/QuizCard.tsx:27` | text | Choices |
| `ios.app.feed.quizcard.003` | `app/feed/QuizCard.tsx:48` | attr-label | Submitting... |
| `ios.app.feed.quizcard.004` | `app/feed/QuizCard.tsx:48` | attr-label | Submit |
| `ios.app.feed.quizcard.005` | `app/feed/QuizCard.tsx:66` | text | Correct |
| `ios.app.feed.quizcard.006` | `app/feed/QuizCard.tsx:66` | text | Not quite |
| `ios.app.feed.sentencecard.001` | `app/feed/SentenceCard.tsx:23` | attr-label | Sentence |
| `ios.app.feed.sentencecard.002` | `app/feed/SentenceCard.tsx:28` | attr-placeholder | Type your sentence |
| `ios.app.feed.sentencecard.003` | `app/feed/SentenceCard.tsx:35` | attr-label | Submitting... |
| `ios.app.feed.sentencecard.004` | `app/feed/SentenceCard.tsx:35` | attr-label | Submit |
| `ios.app.feed.sentencecard.005` | `app/feed/SentenceCard.tsx:52` | text | Score: ${result.score} |
| `ios.app.feed.wordcard.001` | `app/feed/WordCard.tsx:26` | attr-label | Mastered |
| `ios.app.feed.wordcard.002` | `app/feed/WordCard.tsx:28` | text | Definition |
| `ios.app.feed.wordcard.003` | `app/feed/WordCard.tsx:30` | text | Examples |
| `ios.app.feed.wordcard.004` | `app/feed/WordCard.tsx:32` | text | No examples yet. |
| `ios.app.messages.messagebannerstack.001` | `app/messages/MessageBannerStack.tsx:74` | text | Next reset: ${nextReset} |
| `ios.app.messages.messagebannerstack.002` | `app/messages/MessageBannerStack.tsx:91` | text | Dismiss |
| `ios.app.navigation.authnavigator.001` | `app/navigation/AuthNavigator.tsx:26` | property-title | Welcome |
| `ios.app.navigation.authnavigator.002` | `app/navigation/AuthNavigator.tsx:27` | property-title | Create Account |
| `ios.app.navigation.authnavigator.003` | `app/navigation/AuthNavigator.tsx:28` | property-title | Reset Password |
| `ios.app.navigation.authnavigator.004` | `app/navigation/AuthNavigator.tsx:29` | property-title | Choose Password |
| `ios.app.navigation.authnavigator.005` | `app/navigation/AuthNavigator.tsx:30` | property-title | Verify Email |
| `ios.app.navigation.mainnavigator.001` | `app/navigation/MainNavigator.tsx:20` | property-title | VocabCat |
| `ios.app.navigation.mainnavigator.002` | `app/navigation/MainNavigator.tsx:22` | property-title | Configure |
| `ios.app.navigation.mainnavigator.003` | `app/navigation/MainNavigator.tsx:23` | property-title | Stats & Summary |
| `ios.app.navigation.mainnavigator.004` | `app/navigation/MainNavigator.tsx:24` | property-title | Diagnostics |
| `ios.app.navigation.pendingnavigator.001` | `app/navigation/PendingNavigator.tsx:22` | property-title | Verify Email |
| `ios.app.navigation.pendingnavigator.002` | `app/navigation/PendingNavigator.tsx:24` | property-title | Reset Password |
| `ios.app.navigation.pendingnavigator.003` | `app/navigation/PendingNavigator.tsx:25` | property-title | Choose Password |
| `ios.app.navigation.pendingnavigator.004` | `app/navigation/PendingNavigator.tsx:26` | property-title | Verify Email |
| `ios.app.screens.authintroscreen.001` | `app/screens/AuthIntroScreen.tsx:22` | property-label | Daily feed |
| `ios.app.screens.authintroscreen.002` | `app/screens/AuthIntroScreen.tsx:23` | property-title | Swipe through words in context. |
| `ios.app.screens.authintroscreen.003` | `app/screens/AuthIntroScreen.tsx:24` | property-body | Definitions, examples, and short prompts stay in one focused flow. |
| `ios.app.screens.authintroscreen.004` | `app/screens/AuthIntroScreen.tsx:29` | property-label | Recall checks |
| `ios.app.screens.authintroscreen.005` | `app/screens/AuthIntroScreen.tsx:30` | property-title | Answer while the word is fresh. |
| `ios.app.screens.authintroscreen.006` | `app/screens/AuthIntroScreen.tsx:31` | property-body | Quick feedback helps each session stay useful without slowing you down. |
| `ios.app.screens.authintroscreen.007` | `app/screens/AuthIntroScreen.tsx:36` | property-label | Progress |
| `ios.app.screens.authintroscreen.008` | `app/screens/AuthIntroScreen.tsx:37` | property-title | Keep your pace visible. |
| `ios.app.screens.authintroscreen.009` | `app/screens/AuthIntroScreen.tsx:38` | property-body | Streaks, accuracy, and daily targets make the habit easier to manage. |
| `ios.app.screens.authintroscreen.010` | `app/screens/AuthIntroScreen.tsx:51` | text | VocabCat |
| `ios.app.screens.authintroscreen.011` | `app/screens/AuthIntroScreen.tsx:53` | text | Log in |
| `ios.app.screens.authintroscreen.012` | `app/screens/AuthIntroScreen.tsx:59` | text | Vocabulary that keeps moving |
| `ios.app.screens.authintroscreen.013` | `app/screens/AuthIntroScreen.tsx:60` | text | Build a word habit one focused swipe at a time. |
| `ios.app.screens.authintroscreen.014` | `app/screens/AuthIntroScreen.tsx:62` | text | VocabCat turns vocabulary practice into a short daily feed with context, recall checks, and progress you can understand at a glance. |
| `ios.app.screens.authintroscreen.015` | `app/screens/AuthIntroScreen.tsx:65` | attr-label | Log in / Sign up |
| `ios.app.screens.authintroscreen.016` | `app/screens/AuthIntroScreen.tsx:82` | text | 3 min |
| `ios.app.screens.authintroscreen.017` | `app/screens/AuthIntroScreen.tsx:83` | text | Next check ready |
| `ios.app.screens.authintroscreen.018` | `app/screens/AuthIntroScreen.tsx:89` | text | How it works |
| `ios.app.screens.authintroscreen.019` | `app/screens/AuthIntroScreen.tsx:90` | text | Learn, recall, and adjust your pace. |
| `ios.app.screens.diagnosticsscreen.001` | `app/screens/DiagnosticsScreen.tsx:52` | text | Client Logs |
| `ios.app.screens.diagnosticsscreen.002` | `app/screens/DiagnosticsScreen.tsx:54` | attr-label | Pinging... |
| `ios.app.screens.diagnosticsscreen.003` | `app/screens/DiagnosticsScreen.tsx:54` | attr-label | API Ping |
| `ios.app.screens.diagnosticsscreen.004` | `app/screens/DiagnosticsScreen.tsx:55` | attr-label | Copied |
| `ios.app.screens.diagnosticsscreen.005` | `app/screens/DiagnosticsScreen.tsx:55` | attr-label | Copy |
| `ios.app.screens.diagnosticsscreen.006` | `app/screens/DiagnosticsScreen.tsx:58` | text | Showing last |
| `ios.app.screens.diagnosticsscreen.007` | `app/screens/DiagnosticsScreen.tsx:58` | text | entries. |
| `ios.app.screens.diagnosticsscreen.008` | `app/screens/DiagnosticsScreen.tsx:65` | text | - |
| `ios.app.screens.diagnosticsscreen.009` | `app/screens/DiagnosticsScreen.tsx:65` | text | - |
| `ios.app.screens.emailverificationpendingscreen.001` | `app/screens/EmailVerificationPendingScreen.tsx:33` | status | Email verification code sent to ${user?.email ?? "your inbox"}. |
| `ios.app.screens.emailverificationpendingscreen.002` | `app/screens/EmailVerificationPendingScreen.tsx:34` | status | Your email is already verified. |
| `ios.app.screens.emailverificationpendingscreen.003` | `app/screens/EmailVerificationPendingScreen.tsx:56` | status | Your account is still waiting for email verification. |
| `ios.app.screens.emailverificationpendingscreen.004` | `app/screens/EmailVerificationPendingScreen.tsx:65` | status | Your email is now verified. |
| `ios.app.screens.emailverificationpendingscreen.005` | `app/screens/EmailVerificationPendingScreen.tsx:77` | text | Check your inbox |
| `ios.app.screens.emailverificationpendingscreen.006` | `app/screens/EmailVerificationPendingScreen.tsx:79` | text | Your account stays in the verification flow until this email is verified. |
| `ios.app.screens.emailverificationpendingscreen.007` | `app/screens/EmailVerificationPendingScreen.tsx:82` | text | Send an email verification code to |
| `ios.app.screens.emailverificationpendingscreen.008` | `app/screens/EmailVerificationPendingScreen.tsx:82` | text | , then enter it here. |
| `ios.app.screens.emailverificationpendingscreen.009` | `app/screens/EmailVerificationPendingScreen.tsx:89` | attr-label | Sending... |
| `ios.app.screens.emailverificationpendingscreen.010` | `app/screens/EmailVerificationPendingScreen.tsx:89` | attr-label | Resend email verification code |
| `ios.app.screens.emailverificationpendingscreen.011` | `app/screens/EmailVerificationPendingScreen.tsx:89` | attr-label | Send email verification code |
| `ios.app.screens.emailverificationpendingscreen.012` | `app/screens/EmailVerificationPendingScreen.tsx:96` | attr-label | Email verification code |
| `ios.app.screens.emailverificationpendingscreen.013` | `app/screens/EmailVerificationPendingScreen.tsx:99` | attr-placeholder | 123456 |
| `ios.app.screens.emailverificationpendingscreen.014` | `app/screens/EmailVerificationPendingScreen.tsx:107` | attr-label | Verifying... |
| `ios.app.screens.emailverificationpendingscreen.015` | `app/screens/EmailVerificationPendingScreen.tsx:107` | attr-label | Verify code |
| `ios.app.screens.emailverificationpendingscreen.016` | `app/screens/EmailVerificationPendingScreen.tsx:114` | attr-label | I already verified |
| `ios.app.screens.emailverificationpendingscreen.017` | `app/screens/EmailVerificationPendingScreen.tsx:115` | attr-label | Sign out |
| `ios.app.screens.emailverificationpendingscreen.018` | `app/screens/EmailVerificationPendingScreen.tsx:117` | text | Need to reset your password? |
| `ios.app.screens.feedscreen.001` | `app/screens/FeedScreen.tsx:380` | text | Tap to retry |
| `ios.app.screens.forgotpasswordscreen.001` | `app/screens/ForgotPasswordScreen.tsx:44` | text | Reset your password |
| `ios.app.screens.forgotpasswordscreen.002` | `app/screens/ForgotPasswordScreen.tsx:45` | text | We will email you a reset link if an account exists. |
| `ios.app.screens.forgotpasswordscreen.003` | `app/screens/ForgotPasswordScreen.tsx:51` | attr-label | Email |
| `ios.app.screens.forgotpasswordscreen.004` | `app/screens/ForgotPasswordScreen.tsx:54` | attr-placeholder | you@email.com |
| `ios.app.screens.forgotpasswordscreen.005` | `app/screens/ForgotPasswordScreen.tsx:61` | attr-label | Sending... |
| `ios.app.screens.forgotpasswordscreen.006` | `app/screens/ForgotPasswordScreen.tsx:61` | attr-label | Send reset link |
| `ios.app.screens.forgotpasswordscreen.007` | `app/screens/ForgotPasswordScreen.tsx:64` | text | Back to login |
| `ios.app.screens.homescreen.001` | `app/screens/HomeScreen.tsx:47` | text | VocabCat |
| `ios.app.screens.homescreen.002` | `app/screens/HomeScreen.tsx:48` | text | Choose your next move. |
| `ios.app.screens.homescreen.003` | `app/screens/HomeScreen.tsx:51` | text | Log out |
| `ios.app.screens.homescreen.004` | `app/screens/HomeScreen.tsx:59` | text | Start |
| `ios.app.screens.homescreen.005` | `app/screens/HomeScreen.tsx:61` | text | Start Scrolling |
| `ios.app.screens.homescreen.006` | `app/screens/HomeScreen.tsx:63` | text | Dive into words, quizzes, and prompts in a full-screen feed. |
| `ios.app.screens.homescreen.007` | `app/screens/HomeScreen.tsx:73` | text | Configure |
| `ios.app.screens.homescreen.008` | `app/screens/HomeScreen.tsx:75` | text | Preferences |
| `ios.app.screens.homescreen.009` | `app/screens/HomeScreen.tsx:76` | text | Set your goals, timezone, and SMS updates. |
| `ios.app.screens.homescreen.010` | `app/screens/HomeScreen.tsx:83` | text | Stats |
| `ios.app.screens.homescreen.011` | `app/screens/HomeScreen.tsx:85` | text | Stats & Summary |
| `ios.app.screens.homescreen.012` | `app/screens/HomeScreen.tsx:86` | text | Track streaks, accuracy, and progress. |
| `ios.app.screens.homescreen.013` | `app/screens/HomeScreen.tsx:93` | text | Diagnostics |
| `ios.app.screens.loginscreen.001` | `app/screens/LoginScreen.tsx:83` | text | Welcome back |
| `ios.app.screens.loginscreen.002` | `app/screens/LoginScreen.tsx:84` | text | Sign in to continue your word streak. |
| `ios.app.screens.loginscreen.003` | `app/screens/LoginScreen.tsx:89` | attr-label | Email |
| `ios.app.screens.loginscreen.004` | `app/screens/LoginScreen.tsx:92` | attr-placeholder | you@email.com |
| `ios.app.screens.loginscreen.005` | `app/screens/LoginScreen.tsx:99` | attr-label | Password |
| `ios.app.screens.loginscreen.006` | `app/screens/LoginScreen.tsx:102` | attr-placeholder | ******** |
| `ios.app.screens.loginscreen.007` | `app/screens/LoginScreen.tsx:109` | attr-label | Signing in... |
| `ios.app.screens.loginscreen.008` | `app/screens/LoginScreen.tsx:109` | attr-label | Sign In |
| `ios.app.screens.loginscreen.009` | `app/screens/LoginScreen.tsx:112` | text | Forgot your password? |
| `ios.app.screens.loginscreen.010` | `app/screens/LoginScreen.tsx:116` | text | or |
| `ios.app.screens.loginscreen.011` | `app/screens/LoginScreen.tsx:120` | attr-label | Connecting Google... |
| `ios.app.screens.loginscreen.012` | `app/screens/LoginScreen.tsx:120` | attr-label | Continue with Google |
| `ios.app.screens.loginscreen.013` | `app/screens/LoginScreen.tsx:135` | text | New here? Create an account |
| `ios.app.screens.registerscreen.001` | `app/screens/RegisterScreen.tsx:44` | status | Confirm your age and accept the Terms of Use and Privacy Policy first. |
| `ios.app.screens.registerscreen.002` | `app/screens/RegisterScreen.tsx:66` | status | Confirm your age and accept the Terms of Use and Privacy Policy first. |
| `ios.app.screens.registerscreen.003` | `app/screens/RegisterScreen.tsx:82` | status | Confirm your age and accept the Terms of Use and Privacy Policy first. |
| `ios.app.screens.registerscreen.004` | `app/screens/RegisterScreen.tsx:105` | text | Create your account |
| `ios.app.screens.registerscreen.005` | `app/screens/RegisterScreen.tsx:106` | text | Build a daily vocabulary habit in minutes. |
| `ios.app.screens.registerscreen.006` | `app/screens/RegisterScreen.tsx:111` | attr-label | Display name |
| `ios.app.screens.registerscreen.007` | `app/screens/RegisterScreen.tsx:114` | attr-placeholder | What should we call you? |
| `ios.app.screens.registerscreen.008` | `app/screens/RegisterScreen.tsx:120` | attr-label | Email |
| `ios.app.screens.registerscreen.009` | `app/screens/RegisterScreen.tsx:123` | attr-placeholder | you@email.com |
| `ios.app.screens.registerscreen.010` | `app/screens/RegisterScreen.tsx:130` | attr-label | Password |
| `ios.app.screens.registerscreen.011` | `app/screens/RegisterScreen.tsx:133` | attr-placeholder | Create a password |
| `ios.app.screens.registerscreen.012` | `app/screens/RegisterScreen.tsx:147` | text | ✓ |
| `ios.app.screens.registerscreen.013` | `app/screens/RegisterScreen.tsx:149` | text | I confirm that I am at least 13 years old. |
| `ios.app.screens.registerscreen.014` | `app/screens/RegisterScreen.tsx:158` | text | ✓ |
| `ios.app.screens.registerscreen.015` | `app/screens/RegisterScreen.tsx:160` | text | I agree to the Terms of Use and Privacy Policy. |
| `ios.app.screens.registerscreen.016` | `app/screens/RegisterScreen.tsx:162` | attr-label | Creating... |
| `ios.app.screens.registerscreen.017` | `app/screens/RegisterScreen.tsx:162` | attr-label | Create Account |
| `ios.app.screens.registerscreen.018` | `app/screens/RegisterScreen.tsx:166` | text | or |
| `ios.app.screens.registerscreen.019` | `app/screens/RegisterScreen.tsx:170` | attr-label | Connecting Google... |
| `ios.app.screens.registerscreen.020` | `app/screens/RegisterScreen.tsx:170` | attr-label | Continue with Google |
| `ios.app.screens.registerscreen.021` | `app/screens/RegisterScreen.tsx:188` | text | Already have an account? Sign in |
| `ios.app.screens.resetpasswordscreen.001` | `app/screens/ResetPasswordScreen.tsx:30` | status | A reset token is required. |
| `ios.app.screens.resetpasswordscreen.002` | `app/screens/ResetPasswordScreen.tsx:34` | status | Passwords do not match. |
| `ios.app.screens.resetpasswordscreen.003` | `app/screens/ResetPasswordScreen.tsx:54` | text | Choose a new password |
| `ios.app.screens.resetpasswordscreen.004` | `app/screens/ResetPasswordScreen.tsx:55` | text | Paste the token from your email if the screen did not open it automatically. |
| `ios.app.screens.resetpasswordscreen.005` | `app/screens/ResetPasswordScreen.tsx:61` | attr-label | Reset token |
| `ios.app.screens.resetpasswordscreen.006` | `app/screens/ResetPasswordScreen.tsx:64` | attr-placeholder | Paste your token |
| `ios.app.screens.resetpasswordscreen.007` | `app/screens/ResetPasswordScreen.tsx:70` | attr-label | New password |
| `ios.app.screens.resetpasswordscreen.008` | `app/screens/ResetPasswordScreen.tsx:73` | attr-placeholder | Create a strong password |
| `ios.app.screens.resetpasswordscreen.009` | `app/screens/ResetPasswordScreen.tsx:80` | attr-label | Confirm password |
| `ios.app.screens.resetpasswordscreen.010` | `app/screens/ResetPasswordScreen.tsx:83` | attr-placeholder | Repeat your password |
| `ios.app.screens.resetpasswordscreen.011` | `app/screens/ResetPasswordScreen.tsx:90` | attr-label | Updating... |
| `ios.app.screens.resetpasswordscreen.012` | `app/screens/ResetPasswordScreen.tsx:90` | attr-label | Update password |
| `ios.app.screens.resetpasswordscreen.013` | `app/screens/ResetPasswordScreen.tsx:93` | text | Back to login |
| `ios.app.screens.settingsscreen.001` | `app/screens/SettingsScreen.tsx:167` | status | Preferences updated. |
| `ios.app.screens.settingsscreen.002` | `app/screens/SettingsScreen.tsx:191` | status | Your email is already verified. |
| `ios.app.screens.settingsscreen.003` | `app/screens/SettingsScreen.tsx:193` | status | Verification email sent. |
| `ios.app.screens.settingsscreen.004` | `app/screens/SettingsScreen.tsx:220` | status | Enter a phone number in E.164 format. |
| `ios.app.screens.settingsscreen.005` | `app/screens/SettingsScreen.tsx:236` | status | SMS notifications enabled. |
| `ios.app.screens.settingsscreen.006` | `app/screens/SettingsScreen.tsx:255` | status | SMS notifications disabled. |
| `ios.app.screens.settingsscreen.007` | `app/screens/SettingsScreen.tsx:277` | status | Type "DELETE" to confirm account deletion. |
| `ios.app.screens.settingsscreen.008` | `app/screens/SettingsScreen.tsx:281` | status | Delete account |
| `ios.app.screens.settingsscreen.009` | `app/screens/SettingsScreen.tsx:282` | status | This permanently deletes your account, progress, messages, saved sessions, and settings. |
| `ios.app.screens.settingsscreen.010` | `app/screens/SettingsScreen.tsx:296` | status | This link is not configured yet. |
| `ios.app.screens.settingsscreen.011` | `app/screens/SettingsScreen.tsx:302` | status | Unable to open link. |
| `ios.app.screens.settingsscreen.012` | `app/screens/SettingsScreen.tsx:313` | status | Title must be between 4 and 120 characters. |
| `ios.app.screens.settingsscreen.013` | `app/screens/SettingsScreen.tsx:317` | status | Description must be between 10 and 4000 characters. |
| `ios.app.screens.settingsscreen.014` | `app/screens/SettingsScreen.tsx:340` | status | Issue ${response.id} submitted. We'll follow up soon. |
| `ios.app.screens.settingsscreen.015` | `app/screens/SettingsScreen.tsx:346` | status | Rate limited. Try again in ${err.retryAfterSeconds}s. |
| `ios.app.screens.settingsscreen.016` | `app/screens/SettingsScreen.tsx:369` | text | Preferences |
| `ios.app.screens.settingsscreen.017` | `app/screens/SettingsScreen.tsx:371` | text | Timezone |
| `ios.app.screens.settingsscreen.018` | `app/screens/SettingsScreen.tsx:376` | attr-placeholder | America/Los_Angeles |
| `ios.app.screens.settingsscreen.019` | `app/screens/SettingsScreen.tsx:381` | text | Words per week |
| `ios.app.screens.settingsscreen.020` | `app/screens/SettingsScreen.tsx:391` | text | Range ${MIN_WORDS_PER_WEEK}-${MAX_WORDS_PER_WEEK}. About ${deriveDailyGoal( clampInteger(parseNumberInput(wordsPerWeek, DEFAULT_WORDS_PER_WEEK), MIN_WORDS_PER_WEEK, MAX_WORDS_PER_WEEK) )} new words/day. |
| `ios.app.screens.settingsscreen.021` | `app/screens/SettingsScreen.tsx:397` | text | Texts per week |
| `ios.app.screens.settingsscreen.022` | `app/screens/SettingsScreen.tsx:407` | text | Range ${MIN_TEXTS_PER_WEEK}-${MAX_TEXTS_PER_WEEK}. |
| `ios.app.screens.settingsscreen.023` | `app/screens/SettingsScreen.tsx:410` | attr-label | Saving... |
| `ios.app.screens.settingsscreen.024` | `app/screens/SettingsScreen.tsx:410` | attr-label | Save |
| `ios.app.screens.settingsscreen.025` | `app/screens/SettingsScreen.tsx:414` | text | Email Verification |
| `ios.app.screens.settingsscreen.026` | `app/screens/SettingsScreen.tsx:416` | text | Email: ${email} |
| `ios.app.screens.settingsscreen.027` | `app/screens/SettingsScreen.tsx:416` | text | No email address on file. |
| `ios.app.screens.settingsscreen.028` | `app/screens/SettingsScreen.tsx:420` | text | Status: Verified |
| `ios.app.screens.settingsscreen.029` | `app/screens/SettingsScreen.tsx:422` | text | Status: Not verified |
| `ios.app.screens.settingsscreen.030` | `app/screens/SettingsScreen.tsx:423` | text | Status: Unknown |
| `ios.app.screens.settingsscreen.031` | `app/screens/SettingsScreen.tsx:427` | attr-label | Sending... |
| `ios.app.screens.settingsscreen.032` | `app/screens/SettingsScreen.tsx:427` | attr-label | Resend verification |
| `ios.app.screens.settingsscreen.033` | `app/screens/SettingsScreen.tsx:435` | text | SMS Notifications |
| `ios.app.screens.settingsscreen.034` | `app/screens/SettingsScreen.tsx:436` | text | Status: |
| `ios.app.screens.settingsscreen.035` | `app/screens/SettingsScreen.tsx:444` | attr-placeholder | +14155551234 |
| `ios.app.screens.settingsscreen.036` | `app/screens/SettingsScreen.tsx:449` | attr-label | Updating... |
| `ios.app.screens.settingsscreen.037` | `app/screens/SettingsScreen.tsx:449` | attr-label | Opt out |
| `ios.app.screens.settingsscreen.038` | `app/screens/SettingsScreen.tsx:455` | attr-label | Updating... |
| `ios.app.screens.settingsscreen.039` | `app/screens/SettingsScreen.tsx:455` | attr-label | Opt in |
| `ios.app.screens.settingsscreen.040` | `app/screens/SettingsScreen.tsx:465` | text | Support & Privacy |
| `ios.app.screens.settingsscreen.041` | `app/screens/SettingsScreen.tsx:467` | text | Use these links for support, privacy policy details, and reviewer reference. |
| `ios.app.screens.settingsscreen.042` | `app/screens/SettingsScreen.tsx:471` | attr-label | Support |
| `ios.app.screens.settingsscreen.043` | `app/screens/SettingsScreen.tsx:477` | attr-label | Privacy policy |
| `ios.app.screens.settingsscreen.044` | `app/screens/SettingsScreen.tsx:486` | text | Delete Account |
| `ios.app.screens.settingsscreen.045` | `app/screens/SettingsScreen.tsx:488` | text | This permanently deletes your account, progress, messages, saved sessions, and settings. |
| `ios.app.screens.settingsscreen.046` | `app/screens/SettingsScreen.tsx:491` | text | Type DELETE to confirm |
| `ios.app.screens.settingsscreen.047` | `app/screens/SettingsScreen.tsx:498` | attr-placeholder | DELETE |
| `ios.app.screens.settingsscreen.048` | `app/screens/SettingsScreen.tsx:504` | attr-label | Deleting... |
| `ios.app.screens.settingsscreen.049` | `app/screens/SettingsScreen.tsx:504` | attr-label | Delete account |
| `ios.app.screens.settingsscreen.050` | `app/screens/SettingsScreen.tsx:514` | text | Help & Issue Reporting |
| `ios.app.screens.settingsscreen.051` | `app/screens/SettingsScreen.tsx:516` | text | Send an issue directly to support. |
| `ios.app.screens.settingsscreen.052` | `app/screens/SettingsScreen.tsx:520` | text | Request ID: ${helpRequestId} |
| `ios.app.screens.settingsscreen.053` | `app/screens/SettingsScreen.tsx:525` | text | Title |
| `ios.app.screens.settingsscreen.054` | `app/screens/SettingsScreen.tsx:530` | attr-placeholder | Short summary |
| `ios.app.screens.settingsscreen.055` | `app/screens/SettingsScreen.tsx:536` | text | Description |
| `ios.app.screens.settingsscreen.056` | `app/screens/SettingsScreen.tsx:541` | attr-placeholder | Tell us what happened and how to reproduce it |
| `ios.app.screens.settingsscreen.057` | `app/screens/SettingsScreen.tsx:549` | text | Category |
| `ios.app.screens.settingsscreen.058` | `app/screens/SettingsScreen.tsx:575` | text | Severity |
| `ios.app.screens.settingsscreen.059` | `app/screens/SettingsScreen.tsx:601` | attr-label | Submit issue |
| `ios.app.screens.settingsscreen.060` | `app/screens/SettingsScreen.tsx:609` | text | Diagnostics available for debugging. |
| `ios.app.screens.settingsscreen.061` | `app/screens/SettingsScreen.tsx:611` | text | Open diagnostics |
| `ios.app.screens.statsscreen.001` | `app/screens/StatsScreen.tsx:34` | property-label | Recent |
| `ios.app.screens.statsscreen.002` | `app/screens/StatsScreen.tsx:35` | property-label | Highest mastery |
| `ios.app.screens.statsscreen.003` | `app/screens/StatsScreen.tsx:36` | property-label | Lowest mastery |
| `ios.app.screens.statsscreen.004` | `app/screens/StatsScreen.tsx:37` | property-label | Highest learned |
| `ios.app.screens.statsscreen.005` | `app/screens/StatsScreen.tsx:38` | property-label | Lowest learned |
| `ios.app.screens.statsscreen.006` | `app/screens/StatsScreen.tsx:39` | property-label | Most seen |
| `ios.app.screens.statsscreen.007` | `app/screens/StatsScreen.tsx:40` | property-label | Least seen |
| `ios.app.screens.statsscreen.008` | `app/screens/StatsScreen.tsx:41` | property-label | Highest accuracy |
| `ios.app.screens.statsscreen.009` | `app/screens/StatsScreen.tsx:42` | property-label | Lowest accuracy |
| `ios.app.screens.statsscreen.010` | `app/screens/StatsScreen.tsx:46` | property-label | Any |
| `ios.app.screens.statsscreen.011` | `app/screens/StatsScreen.tsx:47` | property-label | Assigned only |
| `ios.app.screens.statsscreen.012` | `app/screens/StatsScreen.tsx:48` | property-label | Exclude assigned |
| `ios.app.screens.statsscreen.013` | `app/screens/StatsScreen.tsx:52` | property-label | All |
| `ios.app.screens.statsscreen.014` | `app/screens/StatsScreen.tsx:53` | property-label | New |
| `ios.app.screens.statsscreen.015` | `app/screens/StatsScreen.tsx:54` | property-label | Learning |
| `ios.app.screens.statsscreen.016` | `app/screens/StatsScreen.tsx:55` | property-label | Reviewing |
| `ios.app.screens.statsscreen.017` | `app/screens/StatsScreen.tsx:56` | property-label | Mastered |
| `ios.app.screens.statsscreen.018` | `app/screens/StatsScreen.tsx:254` | text | Streak (Current) |
| `ios.app.screens.statsscreen.019` | `app/screens/StatsScreen.tsx:258` | text | Streak (Longest) |
| `ios.app.screens.statsscreen.020` | `app/screens/StatsScreen.tsx:264` | text | Streak |
| `ios.app.screens.statsscreen.021` | `app/screens/StatsScreen.tsx:269` | text | Mastered |
| `ios.app.screens.statsscreen.022` | `app/screens/StatsScreen.tsx:273` | text | Learning |
| `ios.app.screens.statsscreen.023` | `app/screens/StatsScreen.tsx:277` | text | Due |
| `ios.app.screens.statsscreen.024` | `app/screens/StatsScreen.tsx:281` | text | Accuracy |
| `ios.app.screens.statsscreen.025` | `app/screens/StatsScreen.tsx:283` | text | % |
| `ios.app.screens.statsscreen.026` | `app/screens/StatsScreen.tsx:290` | text | All Words |
| `ios.app.screens.statsscreen.027` | `app/screens/StatsScreen.tsx:292` | text | ${items.length} of ${total} |
| `ios.app.screens.statsscreen.028` | `app/screens/StatsScreen.tsx:292` | text | ${items.length} |
| `ios.app.screens.statsscreen.029` | `app/screens/StatsScreen.tsx:297` | text | Search |
| `ios.app.screens.statsscreen.030` | `app/screens/StatsScreen.tsx:301` | attr-placeholder | Search by word… |
| `ios.app.screens.statsscreen.031` | `app/screens/StatsScreen.tsx:309` | attr-label | Status: ${activeStatusLabel} |
| `ios.app.screens.statsscreen.032` | `app/screens/StatsScreen.tsx:310` | attr-label | Assigned: ${activeAssignedLabel} |
| `ios.app.screens.statsscreen.033` | `app/screens/StatsScreen.tsx:313` | attr-label | Sort: ${activeSortLabel} |
| `ios.app.screens.statsscreen.034` | `app/screens/StatsScreen.tsx:315` | attr-label | Clear |
| `ios.app.screens.statsscreen.035` | `app/screens/StatsScreen.tsx:356` | text | No words to show yet. |
| `ios.app.screens.statsscreen.036` | `app/screens/StatsScreen.tsx:358` | text | Once you start the feed, your learning and reviewing words will appear here. |
| `ios.app.screens.statsscreen.037` | `app/screens/StatsScreen.tsx:374` | text | Assigned |
| `ios.app.screens.statsscreen.038` | `app/screens/StatsScreen.tsx:380` | text | ${item.status} • seen ${item.seen_count}${typeof item.viewed_count === "number" ? \` • viewed ${item.viewed_count}\` : ""}${typeof item.quiz_attempt_count === "number" ? \` • quizzes ${item.quiz_attempt_count}\` : ""}${accuracyPct === null ? "" : \` • acc ${accuracyPct}%\`}${item.next_due_at ? \` • due ${item.next_due_at}\` : ""} |
| `ios.app.screens.statsscreen.039` | `app/screens/StatsScreen.tsx:389` | attr-label | Manage |
| `ios.app.screens.statsscreen.040` | `app/screens/StatsScreen.tsx:394` | text | Learned ${typeof item.learned_rating === "number" ? item.learned_rating : "-"} |
| `ios.app.screens.statsscreen.041` | `app/screens/StatsScreen.tsx:398` | attr-label | -1 |
| `ios.app.screens.statsscreen.042` | `app/screens/StatsScreen.tsx:404` | attr-label | +1 |
| `ios.app.screens.statsscreen.043` | `app/screens/StatsScreen.tsx:414` | text | Mastery ${typeof item.mastery_rating === "number" ? item.mastery_rating : "-"} |
| `ios.app.screens.statsscreen.044` | `app/screens/StatsScreen.tsx:418` | attr-label | -1 |
| `ios.app.screens.statsscreen.045` | `app/screens/StatsScreen.tsx:424` | attr-label | +1 |
| `ios.app.screens.statsscreen.046` | `app/screens/StatsScreen.tsx:446` | text | Sort |
| `ios.app.screens.statsscreen.047` | `app/screens/StatsScreen.tsx:458` | text | ✓ |
| `ios.app.screens.statsscreen.048` | `app/screens/StatsScreen.tsx:474` | text | Assigned filter |
| `ios.app.screens.statsscreen.049` | `app/screens/StatsScreen.tsx:486` | text | ✓ |
| `ios.app.screens.statsscreen.050` | `app/screens/StatsScreen.tsx:497` | text | Status |
| `ios.app.screens.statsscreen.051` | `app/screens/StatsScreen.tsx:509` | text | ✓ |
| `ios.app.screens.verifyemailscreen.001` | `app/screens/VerifyEmailScreen.tsx:27` | property-message | This verification link is missing a token. |
| `ios.app.screens.verifyemailscreen.002` | `app/screens/VerifyEmailScreen.tsx:58` | text | Email verification |
| `ios.app.screens.verifyemailscreen.003` | `app/screens/VerifyEmailScreen.tsx:63` | text | Verifying your email now. |
| `ios.app.screens.verifyemailscreen.004` | `app/screens/VerifyEmailScreen.tsx:70` | text | Your email was already verified. |
| `ios.app.screens.verifyemailscreen.005` | `app/screens/VerifyEmailScreen.tsx:70` | text | Your email is now verified. |
| `ios.app.screens.verifyemailscreen.006` | `app/screens/VerifyEmailScreen.tsx:73` | attr-label | Continue |
| `ios.app.screens.verifyemailscreen.007` | `app/screens/VerifyEmailScreen.tsx:73` | attr-label | Back to login |
| `ios.app.screens.verifyemailscreen.008` | `app/screens/VerifyEmailScreen.tsx:82` | text | Back to login |

<!-- END VERIFIED SOURCE COPY -->
