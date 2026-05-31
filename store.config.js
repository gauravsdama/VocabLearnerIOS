const env = (name, fallback = "") => {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
};

const required = (name) => {
  const value = env(name);
  if (!value) {
    throw new Error(`[store.config] Missing required env var: ${name}`);
  }
  return value;
};

module.exports = {
  configVersion: 0,
  apple: {
    info: {
      "en-US": {
        title: env("APP_STORE_TITLE", "Vocabcat"),
        subtitle: env("APP_STORE_SUBTITLE", "Build a stronger vocabulary"),
        privacyPolicyUrl: required("PRIVACY_POLICY_URL"),
        supportUrl: required("SUPPORT_URL"),
        keywords: env("APP_STORE_KEYWORDS", "SAT,vocabulary,words,study,quiz"),
        description: env(
          "APP_STORE_DESCRIPTION",
          "Vocabcat helps learners build vocabulary with daily word practice, quizzes, and sentence writing.",
        ),
        releaseNotes: env("APP_STORE_RELEASE_NOTES", "Initial App Store release."),
      },
    },
    categories: {
      primary: env("APP_STORE_PRIMARY_CATEGORY", "EDUCATION"),
      secondary: env("APP_STORE_SECONDARY_CATEGORY", "REFERENCE"),
    },
  },
};
