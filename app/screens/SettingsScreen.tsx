import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import InlineError from "../components/InlineError";
import DSCard from "../components/ui/DSCard";
import DSButton from "../components/ui/DSButton";
import { ApiError, apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { FeedPrefs, HelpIssueResponse, MeDTO, ResendEmailVerificationResponse } from "../api/types";
import { iosAppConfig } from "../config";
import { MainStackParamList } from "../navigation/types";
import { colors, radius, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<MainStackParamList, "Settings">;

const showTraceUi = process.env.EXPO_PUBLIC_TRACE_UI === "true";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const FALLBACK_TIMEZONE = "UTC";
const MIN_WORDS_PER_WEEK = 5;
const MAX_WORDS_PER_WEEK = 210;
const MIN_TEXTS_PER_WEEK = 0;
const MAX_TEXTS_PER_WEEK = 14;
const DEFAULT_WORDS_PER_WEEK = 20;
const DEFAULT_TEXTS_PER_WEEK = 3;

type HelpCategory = "bug" | "billing" | "content" | "account" | "other";
type HelpSeverity = "low" | "medium" | "high";
type HelpAttachment = {
  uri: string;
  name: string;
  type: string;
  size?: number;
  width?: number;
  height?: number;
  optimized?: boolean;
};

const helpCategories: HelpCategory[] = ["bug", "billing", "content", "account", "other"];
const helpSeverities: HelpSeverity[] = ["low", "medium", "high"];

const clampInteger = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, Math.trunc(value)));
};

const parseNumberInput = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const deriveDailyGoal = (weekly: number) => {
  if (!Number.isFinite(weekly) || weekly <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(weekly / 7));
};

const SettingsScreen = ({ navigation }: Props) => {
  const { deleteAccount } = useAuth();
  const [timezone, setTimezone] = useState("");
  const [wordsPerWeek, setWordsPerWeek] = useState(String(DEFAULT_WORDS_PER_WEEK));
  const [textsPerWeek, setTextsPerWeek] = useState(String(DEFAULT_TEXTS_PER_WEEK));
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phoneE164, setPhoneE164] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [feedPrefs, setFeedPrefs] = useState<FeedPrefs | null>(null);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [twilioActive, setTwilioActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [helpTitle, setHelpTitle] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [helpCategory, setHelpCategory] = useState<HelpCategory>("other");
  const [helpSeverity, setHelpSeverity] = useState<HelpSeverity>("low");
  const [helpScreenshot, setHelpScreenshot] = useState<HelpAttachment | null>(null);
  const [helpSubmitting, setHelpSubmitting] = useState(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const [helpRequestId, setHelpRequestId] = useState<string | null>(null);
  const [helpSuccess, setHelpSuccess] = useState<string | null>(null);

  const loadUser = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<MeDTO>("/users/me", { method: "GET" }, {
        startId: "IOS_SETTINGS_LOAD_START",
        okId: "IOS_SETTINGS_LOAD_OK",
        failId: "IOS_SETTINGS_LOAD_FAIL"
      });
      const weeklyWords = clampInteger(
        data.words_per_week ??
          (typeof data.daily_new_words_goal === "number"
            ? data.daily_new_words_goal * 7
            : DEFAULT_WORDS_PER_WEEK),
        MIN_WORDS_PER_WEEK,
        MAX_WORDS_PER_WEEK
      );
      const textsGoal = clampInteger(
        data.texts_per_week ?? DEFAULT_TEXTS_PER_WEEK,
        MIN_TEXTS_PER_WEEK,
        MAX_TEXTS_PER_WEEK
      );
      setTimezone(data.timezone || "");
      setWordsPerWeek(String(weeklyWords));
      setTextsPerWeek(String(textsGoal));
      setSmsOptIn(!!data.sms_opt_in);
      setPhoneE164(data.phone_e164 || "");
      setEmail(data.email || "");
      setEmailVerified(data.email_verified ?? null);
      setFeedPrefs(data.feed_prefs ?? null);
      setSmsEnabled(data.sms_enabled ?? data.features?.smsEnabled ?? true);
      setTwilioActive(data.twilio_active ?? false);
    } catch (err: any) {
      setError(err?.message || "Unable to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUser();
  }, []);

  const handleSave = async () => {
    setSuccess(null);
    setError(null);
    setSaving(true);
    try {
      const safeWordsPerWeek = clampInteger(
        parseNumberInput(wordsPerWeek, DEFAULT_WORDS_PER_WEEK),
        MIN_WORDS_PER_WEEK,
        MAX_WORDS_PER_WEEK
      );
      const safeTextsPerWeek = clampInteger(
        parseNumberInput(textsPerWeek, DEFAULT_TEXTS_PER_WEEK),
        MIN_TEXTS_PER_WEEK,
        MAX_TEXTS_PER_WEEK
      );
      const payload: {
        timezone?: string;
        daily_new_words_goal?: number;
        words_per_week?: number;
        texts_per_week?: number;
        feed_prefs?: FeedPrefs;
      } = {
        timezone: timezone.trim() || FALLBACK_TIMEZONE,
        daily_new_words_goal: deriveDailyGoal(safeWordsPerWeek),
        words_per_week: safeWordsPerWeek,
        texts_per_week: safeTextsPerWeek,
        feed_prefs: feedPrefs ?? undefined
      };
      await apiFetch<MeDTO>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      setSuccess("Preferences updated.");
    } catch (err: any) {
      setError(err?.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setSuccess(null);
    setEmailLoading(true);
    try {
      const response = await apiFetch<ResendEmailVerificationResponse>(
        "/auth/resend-verification",
        { method: "POST" },
        {
          startId: "IOS_EMAIL_RESEND_START",
          okId: "IOS_EMAIL_RESEND_OK",
          failId: "IOS_EMAIL_RESEND_FAIL"
        }
      );
      if (!response.sent && response.reason === "already_verified") {
        setEmailVerified(true);
        setSuccess("Your email is already verified.");
      } else {
        setSuccess("Verification email sent.");
      }
    } catch (err: any) {
      setError(err?.message || "Unable to resend verification email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const smsAvailable = smsEnabled && twilioActive;
  const smsStatusLabel = smsAvailable
    ? smsOptIn
      ? "Active"
      : "Available"
    : smsEnabled
      ? "Not active"
      : "Disabled";
  const smsDescription = smsAvailable
    ? smsOptIn
      ? "SMS reminders are enabled for this phone."
      : "SMS is available. Enter an E.164 phone number to opt in."
    : smsEnabled
      ? "SMS delivery is not active for this account yet, so opt-in is unavailable."
      : "SMS is disabled for this account.";

  const handleSmsOptIn = async () => {
    if (!phoneE164.trim()) {
      setError("Enter a phone number in E.164 format.");
      return;
    }
    setError(null);
    setSuccess(null);
    setSmsLoading(true);
    try {
      await apiFetch("/users/me/sms/opt-in", {
        method: "POST",
        body: JSON.stringify({ phone_e164: phoneE164.trim() })
      }, {
        startId: "IOS_SMS_OPTIN_START",
        okId: "IOS_SMS_OPTIN_OK",
        failId: "IOS_SMS_OPTIN_FAIL"
      });
      await loadUser();
      setSuccess("SMS notifications enabled.");
    } catch (err: any) {
      setError(err?.message || "Unable to opt in to SMS.");
    } finally {
      setSmsLoading(false);
    }
  };

  const handleSmsOptOut = async () => {
    setError(null);
    setSuccess(null);
    setSmsLoading(true);
    try {
      await apiFetch("/users/me/sms/opt-out", { method: "POST" }, {
        startId: "IOS_SMS_OPTOUT_START",
        okId: "IOS_SMS_OPTOUT_OK",
        failId: "IOS_SMS_OPTOUT_FAIL"
      });
      await loadUser();
      setSuccess("SMS notifications disabled.");
    } catch (err: any) {
      setError(err?.message || "Unable to opt out of SMS.");
    } finally {
      setSmsLoading(false);
    }
  };

  const runDeleteAccount = async () => {
    setError(null);
    setSuccess(null);
    setDeleteLoading(true);
    try {
      await deleteAccount();
    } catch (err: any) {
      setError(err?.message || "Unable to delete account.");
      setDeleteLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== "DELETE") {
      setError('Type "DELETE" to confirm account deletion.');
      return;
    }
    Alert.alert(
      "Delete account",
      "This permanently deletes your account, progress, messages, saved sessions, and settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void runDeleteAccount()
        }
      ]
    );
  };

  const openExternalUrl = async (url: string) => {
    if (!url) {
      setError("This link is not configured yet.");
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      setError("Unable to open link.");
    }
  };

  const getAssetSize = async (asset: ImagePicker.ImagePickerAsset) => {
    if (typeof asset.fileSize === "number") {
      return asset.fileSize;
    }
    try {
      const info = (await FileSystem.getInfoAsync(asset.uri)) as FileSystem.FileInfo & { size?: number };
      if (typeof info.size === "number") {
        return info.size;
      }
    } catch {
      // ignore size lookup failures
    }
    return 0;
  };

  const optimizeScreenshot = async (asset: ImagePicker.ImagePickerAsset) => {
    const size = await getAssetSize(asset);
    if (size > 0 && size <= MAX_UPLOAD_BYTES) {
      return {
        uri: asset.uri,
        name: asset.fileName || "screenshot.jpg",
        type: asset.mimeType || "image/jpeg",
        size,
        width: asset.width,
        height: asset.height,
        optimized: false
      };
    }

    const baseWidth = asset.width || 1600;
    const ratio = size > 0 ? Math.min(1, Math.max(0.4, Math.sqrt(MAX_UPLOAD_BYTES / size))) : 0.8;
    const targetWidth = Math.max(640, Math.round(baseWidth * ratio));
    const firstPass = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: targetWidth } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    let finalAsset = firstPass;
    let finalSize = 0;
    try {
      const info = (await FileSystem.getInfoAsync(firstPass.uri)) as FileSystem.FileInfo & { size?: number };
      finalSize = typeof info.size === "number" ? info.size : 0;
    } catch {
      finalSize = 0;
    }

    if (finalSize > MAX_UPLOAD_BYTES) {
      const secondPass = await ImageManipulator.manipulateAsync(
        firstPass.uri,
        [{ resize: { width: Math.round(targetWidth * 0.8) } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );
      finalAsset = secondPass;
      try {
        const info = (await FileSystem.getInfoAsync(secondPass.uri)) as FileSystem.FileInfo & { size?: number };
        finalSize = typeof info.size === "number" ? info.size : finalSize;
      } catch {
        // ignore
      }
    }

    if (finalSize > MAX_UPLOAD_BYTES) {
      throw new Error("Screenshot is still above 5MB after compression. Choose a smaller image.");
    }

    return {
      uri: finalAsset.uri,
      name: asset.fileName || "screenshot.jpg",
      type: "image/jpeg",
      size: finalSize,
      width: finalAsset.width,
      height: finalAsset.height,
      optimized: true
    };
  };

  const handlePickScreenshot = async () => {
    setHelpError(null);
    setHelpRequestId(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setHelpError("Allow photo access to attach a screenshot.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });
    if (result.canceled || !result.assets?.length) {
      return;
    }
    try {
      const optimized = await optimizeScreenshot(result.assets[0]);
      setHelpScreenshot(optimized);
    } catch (err: any) {
      setHelpError(err?.message || "Unable to attach screenshot.");
    }
  };

  const handleSubmitHelp = async () => {
    setHelpError(null);
    setHelpRequestId(null);
    setHelpSuccess(null);
    const trimmedTitle = helpTitle.trim();
    const trimmedDescription = helpDescription.trim();
    if (trimmedTitle.length < 4 || trimmedTitle.length > 120) {
      setHelpError("Title must be between 4 and 120 characters.");
      return;
    }
    if (trimmedDescription.length < 10 || trimmedDescription.length > 4000) {
      setHelpError("Description must be between 10 and 4000 characters.");
      return;
    }
    const form = new FormData();
    form.append("title", trimmedTitle);
    form.append("description", trimmedDescription);
    form.append("category", helpCategory);
    form.append("severity", helpSeverity);
    form.append(
      "client_info",
      JSON.stringify({
        platform: Platform.OS,
        platformVersion: Platform.Version
      })
    );
    if (helpScreenshot) {
      form.append("screenshot", {
        uri: helpScreenshot.uri,
        name: helpScreenshot.name,
        type: helpScreenshot.type
      } as unknown as Blob);
    }
    setHelpSubmitting(true);
    try {
      const response = await apiFetch<HelpIssueResponse>("/help/issues", {
        method: "POST",
        body: form
      }, {
        startId: "IOS_HELP_CREATE_START",
        okId: "IOS_HELP_CREATE_OK",
        failId: "IOS_HELP_CREATE_FAIL"
      });
      setHelpSuccess(`Issue ${response.id} submitted. We'll follow up soon.`);
      setHelpTitle("");
      setHelpDescription("");
      setHelpScreenshot(null);
    } catch (err: any) {
      const errorMessage = err?.message || "Unable to submit issue.";
      if (err instanceof ApiError && err.retryAfterSeconds) {
        setHelpError(`Rate limited. Try again in ${err.retryAfterSeconds}s.`);
      } else {
        setHelpError(errorMessage);
      }
      setHelpRequestId(err?.requestId || null);
    } finally {
      setHelpSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <InlineError message={error} />
              {success && <Text style={[styles.success, typography.body]}>{success}</Text>}
          <DSCard style={styles.card}>
            <Text style={[styles.sectionTitle, typography.h2]}>Preferences</Text>
            <View style={styles.field}>
              <Text style={[styles.label, typography.label]}>Timezone</Text>
              <TextInput
                style={styles.input}
                value={timezone}
                onChangeText={setTimezone}
                placeholder="America/Los_Angeles"
                placeholderTextColor={colors.muted}
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, typography.label]}>Words per week</Text>
              <TextInput
                style={styles.input}
                value={wordsPerWeek}
                onChangeText={setWordsPerWeek}
                keyboardType="numeric"
                placeholder={String(DEFAULT_WORDS_PER_WEEK)}
                placeholderTextColor={colors.muted}
              />
              <Text style={[styles.helperText, typography.caption]}>
                {`Range ${MIN_WORDS_PER_WEEK}-${MAX_WORDS_PER_WEEK}. About ${deriveDailyGoal(
                  clampInteger(parseNumberInput(wordsPerWeek, DEFAULT_WORDS_PER_WEEK), MIN_WORDS_PER_WEEK, MAX_WORDS_PER_WEEK)
                )} new words/day.`}
              </Text>
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, typography.label]}>Texts per week</Text>
              <TextInput
                style={styles.input}
                value={textsPerWeek}
                onChangeText={setTextsPerWeek}
                keyboardType="numeric"
                placeholder={String(DEFAULT_TEXTS_PER_WEEK)}
                placeholderTextColor={colors.muted}
              />
              <Text style={[styles.helperText, typography.caption]}>
                {`Range ${MIN_TEXTS_PER_WEEK}-${MAX_TEXTS_PER_WEEK}.`}
              </Text>
            </View>
            <PrimaryButton label={saving ? "Saving..." : "Save"} onPress={handleSave} disabled={saving} />
          </DSCard>

          <DSCard style={styles.card}>
            <Text style={[styles.sectionTitle, typography.h2]}>Email Verification</Text>
            <Text style={[styles.helperText, typography.caption]}>
              {email ? `Email: ${email}` : "No email address on file."}
            </Text>
            <Text style={[styles.helperText, typography.caption]}>
              {emailVerified === true
                ? "Status: Verified"
                : emailVerified === false
                  ? "Status: Not verified"
                  : "Status: Unknown"}
            </Text>
            {emailVerified === false ? (
              <PrimaryButton
                label={emailLoading ? "Sending..." : "Resend verification"}
                onPress={() => void handleResendVerification()}
                disabled={emailLoading}
              />
            ) : null}
          </DSCard>

          <DSCard style={styles.card}>
            <Text style={[styles.sectionTitle, typography.h2]}>SMS Notifications</Text>
            <Text style={[styles.helperText, typography.caption]}>Status: {smsStatusLabel}</Text>
            <Text style={[styles.helperText, typography.caption]}>{smsDescription}</Text>
            {smsAvailable ? (
              <>
                <TextInput
                  style={styles.input}
                  value={phoneE164}
                  onChangeText={setPhoneE164}
                  placeholder="+14155551234"
                  placeholderTextColor={colors.muted}
                />
                {smsOptIn ? (
                  <PrimaryButton
                    label={smsLoading ? "Updating..." : "Opt out"}
                    onPress={handleSmsOptOut}
                    disabled={smsLoading}
                  />
                ) : (
                  <PrimaryButton
                    label={smsLoading ? "Updating..." : "Opt in"}
                    onPress={handleSmsOptIn}
                    disabled={smsLoading}
                  />
                )}
              </>
            ) : null}
          </DSCard>

          <DSCard style={styles.card}>
            <Text style={[styles.sectionTitle, typography.h2]}>Support & Privacy</Text>
            <Text style={[styles.helperText, typography.caption]}>
              Use these links for support, privacy policy details, and reviewer reference.
            </Text>
            <View style={styles.linkActions}>
              <DSButton
                label="Support"
                variant="secondary"
                onPress={() => void openExternalUrl(iosAppConfig.supportUrl)}
                disabled={!iosAppConfig.supportUrl}
              />
              <DSButton
                label="Privacy policy"
                variant="secondary"
                onPress={() => void openExternalUrl(iosAppConfig.privacyPolicyUrl)}
                disabled={!iosAppConfig.privacyPolicyUrl}
              />
            </View>
          </DSCard>

          <DSCard style={styles.card}>
            <Text style={[styles.sectionTitle, typography.h2]}>Delete Account</Text>
            <Text style={[styles.helperText, typography.caption]}>
              This permanently deletes your account, progress, messages, saved sessions, and settings.
            </Text>
            <View style={styles.field}>
              <Text style={[styles.label, typography.label]}>Type DELETE to confirm</Text>
              <TextInput
                style={styles.input}
                value={deleteConfirm}
                onChangeText={setDeleteConfirm}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="DELETE"
                placeholderTextColor={colors.muted}
                editable={!deleteLoading}
              />
            </View>
            <DSButton
              label={deleteLoading ? "Deleting..." : "Delete account"}
              variant="secondary"
              onPress={handleDeleteAccount}
              disabled={deleteConfirm !== "DELETE" || deleteLoading}
              loading={deleteLoading}
              style={styles.dangerButton}
            />
          </DSCard>

          <DSCard style={styles.card}>
            <Text style={[styles.sectionTitle, typography.h2]}>Help & Issue Reporting</Text>
            <Text style={[styles.helperText, typography.body]}>
              Send an issue directly to support. Attach a screenshot if helpful.
            </Text>
            {helpError ? <Text style={[styles.errorText, typography.caption]}>{helpError}</Text> : null}
            {helpRequestId ? (
              <Text style={[styles.requestId, typography.caption]}>{`Request ID: ${helpRequestId}`}</Text>
            ) : null}
            {helpSuccess ? <Text style={[styles.success, typography.caption]}>{helpSuccess}</Text> : null}

            <View style={styles.field}>
              <Text style={[styles.label, typography.label]}>Title</Text>
              <TextInput
                style={styles.input}
                value={helpTitle}
                onChangeText={setHelpTitle}
                placeholder="Short summary"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, typography.label]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={helpDescription}
                onChangeText={setHelpDescription}
                placeholder="Tell us what happened and how to reproduce it"
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, typography.label]}>Category</Text>
              <View style={styles.optionRow}>
                {helpCategories.map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => setHelpCategory(category)}
                    style={[
                      styles.optionChip,
                      helpCategory === category && styles.optionChipActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        typography.caption,
                        helpCategory === category && styles.optionTextActive
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, typography.label]}>Severity</Text>
              <View style={styles.optionRow}>
                {helpSeverities.map((severity) => (
                  <Pressable
                    key={severity}
                    onPress={() => setHelpSeverity(severity)}
                    style={[
                      styles.optionChip,
                      helpSeverity === severity && styles.optionChipActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        typography.caption,
                        helpSeverity === severity && styles.optionTextActive
                      ]}
                    >
                      {severity}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, typography.label]}>Screenshot (optional)</Text>
              <View style={styles.screenshotRow}>
                {helpScreenshot ? (
                  <Image source={{ uri: helpScreenshot.uri }} style={styles.screenshotPreview} />
                ) : (
                  <View style={styles.screenshotPlaceholder}>
                    <Text style={[styles.helperText, typography.caption]}>No screenshot selected.</Text>
                  </View>
                )}
                <View style={styles.screenshotMeta}>
                  {helpScreenshot ? (
                    <>
                      <Text style={[styles.helperText, typography.caption]}>{helpScreenshot.name}</Text>
                      {typeof helpScreenshot.size === "number" ? (
                        <Text style={[styles.helperText, typography.caption]}>
                          {(helpScreenshot.size / (1024 * 1024)).toFixed(2)} MB
                        </Text>
                      ) : null}
                      {helpScreenshot.optimized ? (
                        <Text style={[styles.helperText, typography.caption]}>Optimized to fit 5MB.</Text>
                      ) : null}
                    </>
                  ) : null}
                  <View style={styles.screenshotActions}>
                    <DSButton
                      label={helpScreenshot ? "Replace" : "Add screenshot"}
                      variant="secondary"
                      onPress={() => void handlePickScreenshot()}
                    />
                    {helpScreenshot ? (
                      <DSButton label="Remove" variant="ghost" onPress={() => setHelpScreenshot(null)} />
                    ) : null}
                  </View>
                </View>
              </View>
            </View>

            <DSButton
              label="Submit issue"
              onPress={() => void handleSubmitHelp()}
              disabled={helpSubmitting}
              loading={helpSubmitting}
            />

            {showTraceUi ? (
              <View style={styles.helpRow}>
                <Text style={[styles.helperText, typography.caption]}>Diagnostics available for debugging.</Text>
                <Pressable onPress={() => navigation.navigate("Diagnostics")}>
                  <Text style={[styles.helpLink, typography.caption]}>Open diagnostics</Text>
                </Pressable>
              </View>
            ) : null}
          </DSCard>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  field: {
    marginBottom: spacing.s2
  },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: radius.rBtn,
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.s2 - 2,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
    fontFamily: typography.body.fontFamily
  },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    borderRadius: radius.rBtn,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.s2
  },
  segmentButton: {
    flex: 1,
    paddingVertical: spacing.s1 + 2,
    alignItems: "center"
  },
  segmentActive: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.rBtn
  },
  segmentText: {
    color: colors.text
  },
  helperText: {
    marginTop: spacing.s1,
    color: colors.muted
  },
  helpText: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: spacing.s1
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.s4
  },
  success: {
    color: colors.success,
    marginBottom: spacing.s2,
    fontWeight: "600"
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.s1
  },
  requestId: {
    color: colors.muted,
    marginTop: spacing.s1
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: spacing.s2
  },
  card: {
    marginBottom: spacing.s3
  },
  dangerButton: {
    borderColor: colors.danger,
    backgroundColor: colors.surface2
  },
  label: {
    color: colors.muted,
    marginBottom: spacing.s1
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top"
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s1
  },
  optionChip: {
    paddingHorizontal: spacing.s2 - 2,
    paddingVertical: spacing.s1 - 2,
    borderRadius: radius.rPill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  optionChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint
  },
  optionText: {
    color: colors.text,
    textTransform: "capitalize"
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: "600"
  },
  screenshotRow: {
    flexDirection: "row",
    gap: spacing.s2,
    alignItems: "flex-start"
  },
  screenshotPreview: {
    width: 72,
    height: 72,
    borderRadius: radius.rBtn,
    backgroundColor: colors.surface2,
    resizeMode: "cover"
  },
  screenshotPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.rBtn,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.s1,
    backgroundColor: colors.surface2
  },
  screenshotMeta: {
    flex: 1,
    gap: spacing.s1
  },
  screenshotActions: {
    flexDirection: "row",
    gap: spacing.s1,
    alignItems: "center"
  },
  helpRow: {
    marginTop: spacing.s2,
    gap: spacing.s1
  },
  helpLink: {
    color: colors.primary,
    fontWeight: "600"
  },
  linkActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s1,
    marginTop: spacing.s2
  }
});

export default SettingsScreen;
