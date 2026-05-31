export type AuthStackParamList = {
  Intro: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  EmailVerificationPending: undefined;
  VerifyEmail: { token?: string } | undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Feed: undefined;
  Settings: undefined;
  Stats: undefined;
  Diagnostics: undefined;
};
