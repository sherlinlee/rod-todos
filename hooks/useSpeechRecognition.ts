"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};

type SpeechRecognitionErrorEvent = {
  error: string;
};

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function friendlyError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Mic blocked — allow microphone in settings.";
    case "no-speech":
      return "Didn't catch that — try again, Rod.";
    case "audio-capture":
      return "No mic found — check your device.";
    case "network":
      return "Voice needs internet — check your connection.";
    case "aborted":
      return "";
    default:
      return "Couldn't hear you — try again?";
  }
}

async function ensureMicPermission(): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) return false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(
    async (
      onFinal: (text: string) => void,
      onInterim?: (text: string) => void,
    ) => {
      const Ctor = getSpeechRecognition();
      if (!Ctor) {
        setError("Voice works in Chrome, Edge, or Safari.");
        return;
      }

      setError(null);
      const permitted = await ensureMicPermission();
      if (!permitted) {
        setError("Mic blocked — allow microphone when asked.");
        return;
      }

      recognitionRef.current?.abort();

      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-GB";

      recognition.onresult = (event) => {
        let interim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript ?? "";
          if (result.isFinal) finalChunk += text;
          else interim += text;
        }

        if (onInterim) onInterim(interim.trim());
        if (finalChunk) {
          onInterim?.("");
          onFinal(finalChunk.trim());
        }
      };

      recognition.onerror = (event) => {
        const message = friendlyError(event.error);
        if (message) setError(message);
        setListening(false);
      };

      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;

      try {
        recognition.start();
        setListening(true);
      } catch {
        setError("Mic is busy — wait a sec and try again.");
        setListening(false);
      }
    },
    [],
  );

  const toggle = useCallback(
    async (
      onFinal: (text: string) => void,
      onInterim?: (text: string) => void,
    ) => {
      if (listening) {
        stop();
        onInterim?.("");
        return;
      }
      await start(onFinal, onInterim);
    },
    [listening, start, stop],
  );

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  return { supported, listening, error, toggle, stop };
}
