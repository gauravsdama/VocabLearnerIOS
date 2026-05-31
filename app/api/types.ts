export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    request_id?: string;
    retry_after_seconds?: number;
    retryAfterSeconds?: number;
  };
};

export type MessageDTO = {
  id: string;
  code?: string | null;
  title?: string | null;
  body?: string | null;
  message?: string | null;
  level?: "info" | "success" | "warning" | "error" | string | null;
  created_at?: string | null;
  expires_at?: string | null;
  dismissible?: boolean;
  action?: Record<string, unknown> | null;
  action_label?: string | null;
  action_url?: string | null;
  details?: Record<string, unknown>;
  [key: string]: unknown;
};

export type MessagesResponse = {
  messages?: MessageDTO[];
  items?: MessageDTO[];
  page?: number;
  page_size?: number;
};

export type HelpIssueResponse = {
  id: string;
  status: string;
  created_at: string;
  screenshot_url?: string;
};

export type FeedPrefs = Record<string, unknown>;

export type User = {
  id?: string;
  email?: string;
  display_name?: string | null;
  email_verified?: boolean | null;
  last_login_at?: string | null;
  status?: string | null;
  timezone?: string;
  daily_new_words_goal?: number;
  words_per_week?: number;
  texts_per_week?: number;
  feed_prefs?: FeedPrefs;
  sms_opt_in?: boolean;
  sms_enabled?: boolean;
  twilio_active?: boolean;
  phone_e164?: string | null;
};

export type MeDTO = User & {
  email_verified?: boolean | null;
  features?: {
    smsEnabled?: boolean;
  };
  limits?: {
    daily_cards?: number;
  };
  usage?: {
    daily_cards_used?: number;
  };
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
  refresh_expires_in?: number;
  user: User;
  client_signing_key?: string | null;
  needs_email_verification?: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  display_name?: string;
};

export type GoogleAuthRequest = {
  id_token: string;
};

export type AppleAuthRequest = {
  identity_token: string;
  authorization_code?: string | null;
  email?: string | null;
  given_name?: string | null;
  family_name?: string | null;
};

export type RefreshRequest = {
  refresh_token: string;
};

export type LogoutRequest = {
  refresh_token?: string | null;
};

export type MessageResponse = {
  ok?: boolean;
  message: string;
};

export type AccountDeletionRequest = {
  confirmation: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  new_password: string;
};

export type VerifyEmailResponse = {
  verified: boolean;
  already_verified?: boolean;
};

export type VerifyEmailCodeRequest = {
  code: string;
};

export type FeedCardType = "WORD" | "QUIZ_MCQ" | "WRITE_SENTENCE";

export type FeedWord = {
  word_id: string;
  word: string;
  part_of_speech: string;
  definition: string;
  examples: string[];
};

export type FeedQuiz = {
  question_id: string;
  question_type: string;
  prompt: string;
  choices: string[];
  explanation?: string;
};

export type FeedWriteSentence = {
  prompt: string;
};

export type FeedProgress = {
  status: string;
  seen_count: number;
  quiz_attempt_count: number;
  quiz_correct_count: number;
  correct_streak_spaced: number;
  next_due_at: string;
};

export type FeedCard = {
  card_id: string;
  card_type: FeedCardType;
  position_index: number;
  word?: FeedWord;
  quiz?: FeedQuiz;
  write_sentence?: FeedWriteSentence;
  progress?: FeedProgress;
};

export type FeedSessionResponse = {
  feed_session_id: string;
  cards: FeedCard[];
  messages?: MessageDTO[];
  items?: MessageDTO[];
};

export type FeedNextResponse = {
  feed_session_id: string;
  cards: FeedCard[];
  messages?: MessageDTO[];
  items?: MessageDTO[];
};

export type StatsSummary = {
  mastered_count: number;
  learning_count: number;
  due_count: number;
  accuracy: number;
  streak: number | { current_days: number; longest_days: number };
  recent_activity: unknown[];
};

export type QuizSubmitResponse = {
  correct: boolean;
  explanation?: string;
  updated_progress: FeedProgress;
};

export type SentenceSubmitResponse = {
  is_valid: boolean;
  score: number;
  feedback: string;
  updated_progress: FeedProgress;
};

export type StudyProgressStatus = "learning" | "reviewing" | "mastered" | "new";

export type StudyProgressListItem = {
  word_id: number;
  word: string;
  primary_definition: string;
  examples: string[];
  status: StudyProgressStatus;
  seen_count: number;
  viewed_count?: number;
  next_due_at: string | null;
  recommended_question_id: string | null;
  learned_rating?: number;
  mastery_rating?: number;
  quiz_attempt_count?: number;
  quiz_correct_count?: number;
  correct_streak_spaced?: number;
  last_viewed_at?: string | null;
  accuracy?: number | null;
  is_assigned?: boolean;
};

export type StudyProgressListResponse = {
  items: StudyProgressListItem[];
  page: number;
  page_size: number;
  total: number;
};

export type StudyProgressPatchRequest = {
  learned_rating?: number;
  mastery_rating?: number;
  learned_delta?: number;
  mastery_delta?: number;
};

export type StudyProgressPatchResponse = {
  word_id: number;
  progress: {
    status: StudyProgressStatus;
    seen_count: number;
    viewed_count: number;
    quiz_attempt_count: number;
    quiz_correct_count: number;
    correct_streak_spaced: number;
    learned_rating: number;
    mastery_rating: number;
    last_viewed_at: string | null;
    next_due_at: string | null;
  };
};

export type StudyProgressDowngradeResponse = StudyProgressPatchResponse;

export type StudyProgressQuizAttempt = {
  attempt_id: string;
  question_id: string;
  created_at: string;
  correct: boolean;
  chosen_index: number;
  correct_index: number;
  prompt: string;
  choices: string[];
  question_type: string;
  explanation?: string;
};

export type StudyProgressQuizAttemptsResponse = {
  word_id: number;
  page: number;
  page_size: number;
  total: number;
  attempts: StudyProgressQuizAttempt[];
};

export type ResendEmailVerificationResponse = {
  sent: boolean;
  reason?: string | null;
};
