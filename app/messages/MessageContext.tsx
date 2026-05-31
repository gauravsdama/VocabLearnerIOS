import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../api/client";
import { MessageDTO } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { normalizeMessage } from "./messageUtils";

const DISMISSED_KEY = "dismissed_message_ids";

type MessageContextValue = {
  messages: MessageDTO[];
  ingestMessages: (messages?: MessageDTO[]) => void;
  dismissMessage: (messageId: string) => Promise<void>;
  clearMessages: () => void;
};

const MessageContext = createContext<MessageContextValue | undefined>(undefined);

const parseDismissedIds = (raw: string | null) => {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string");
    }
  } catch {
    // ignore storage parse failures
  }
  return [];
};

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const dismissedRef = useRef<Set<string>>(new Set());
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [dismissedLoaded, setDismissedLoaded] = useState(false);

  useEffect(() => {
    const loadDismissed = async () => {
      try {
        const stored = await SecureStore.getItemAsync(DISMISSED_KEY);
        const ids = parseDismissedIds(stored);
        dismissedRef.current = new Set(ids);
      } catch {
        dismissedRef.current = new Set();
      } finally {
        setDismissedLoaded(true);
      }
    };
    void loadDismissed();
  }, []);

  useEffect(() => {
    if (!dismissedLoaded) {
      return;
    }
    setMessages((prev) => prev.filter((message) => !dismissedRef.current.has(message.id)));
  }, [dismissedLoaded]);

  useEffect(() => {
    if (!token) {
      setMessages([]);
    }
  }, [token]);

  const persistDismissed = useCallback(async () => {
    try {
      await SecureStore.setItemAsync(DISMISSED_KEY, JSON.stringify(Array.from(dismissedRef.current)));
    } catch {
      // ignore persistence failures
    }
  }, []);

  const ingestMessages = useCallback((incoming?: MessageDTO[]) => {
    if (!incoming || incoming.length === 0) {
      return;
    }
    setMessages((prev) => {
      const existingIds = new Set(prev.map((message) => message.id));
      const next = [...prev];
      incoming.forEach((message) => {
        if (!message?.id) {
          return;
        }
        if (dismissedRef.current.has(message.id) || existingIds.has(message.id)) {
          return;
        }
        next.push(normalizeMessage(message));
        existingIds.add(message.id);
      });
      return next;
    });
  }, []);

  const dismissMessage = useCallback(
    async (messageId: string) => {
      if (!messageId) {
        return;
      }
      setMessages((prev) => prev.filter((message) => message.id !== messageId));
      if (!dismissedRef.current.has(messageId)) {
        dismissedRef.current.add(messageId);
        await persistDismissed();
      }
      try {
        await apiFetch(`/messages/${messageId}/dismiss`, { method: "POST" });
      } catch {
        // dismiss is best-effort
      }
    },
    [persistDismissed]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value = useMemo<MessageContextValue>(
    () => ({
      messages,
      ingestMessages,
      dismissMessage,
      clearMessages
    }),
    [messages, ingestMessages, dismissMessage, clearMessages]
  );

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};
