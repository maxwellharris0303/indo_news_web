"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chunkSpeechText } from "@/lib/article/speech-text";
import {
  applyUtteranceVoice,
  isSpeechSupported,
  mapSpeechError,
  startSpeechKeepAlive,
  type SpeechStartError,
  warmSpeechVoices,
} from "@/lib/article/speech-synth";

export type ArticleSpeechStatus =
  | "unsupported"
  | "idle"
  | "playing"
  | "paused";

export function useArticleSpeech(fullText: string) {
  const [status, setStatus] = useState<ArticleSpeechStatus>("idle");
  const [speechError, setSpeechError] = useState<SpeechStartError | null>(
    null,
  );
  const queueRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const mountedRef = useRef(true);
  const keepAliveStopRef = useRef<(() => void) | null>(null);
  const startTimerRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    if (!isSpeechSupported()) {
      setStatus("unsupported");
      return () => {
        mountedRef.current = false;
      };
    }

    const refreshVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);

    return () => {
      mountedRef.current = false;
      window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
      keepAliveStopRef.current?.();
      if (startTimerRef.current != null) {
        window.clearTimeout(startTimerRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const clearStartTimer = useCallback(() => {
    if (startTimerRef.current != null) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  }, []);

  const speakNext = useCallback(() => {
    const synth = window.speechSynthesis;
    const queue = queueRef.current;
    const i = indexRef.current;
    if (i >= queue.length) {
      queueRef.current = [];
      indexRef.current = 0;
      keepAliveStopRef.current?.();
      keepAliveStopRef.current = null;
      if (mountedRef.current) setStatus("idle");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(queue[i]);
    const voices =
      voicesRef.current.length > 0
        ? voicesRef.current
        : warmSpeechVoices();
    applyUtteranceVoice(utterance, voices);

    utterance.onstart = () => {
      clearStartTimer();
      if (mountedRef.current) setSpeechError(null);
    };

    utterance.onend = () => {
      indexRef.current += 1;
      speakNext();
    };

    utterance.onerror = (ev) => {
      clearStartTimer();
      keepAliveStopRef.current?.();
      keepAliveStopRef.current = null;
      queueRef.current = [];
      indexRef.current = 0;
      if (mountedRef.current) {
        setSpeechError(mapSpeechError(ev.error));
        setStatus("idle");
      }
    };

    if (synth.paused) synth.resume();
    synth.speak(utterance);

    clearStartTimer();
    startTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      if (!synth.speaking && !synth.pending && queueRef.current.length > 0) {
        setSpeechError("start-failed");
        setStatus("idle");
        queueRef.current = [];
        indexRef.current = 0;
        keepAliveStopRef.current?.();
        keepAliveStopRef.current = null;
        synth.cancel();
      }
    }, 800);
  }, [clearStartTimer]);

  const stop = useCallback(() => {
    if (!isSpeechSupported()) return;
    clearStartTimer();
    keepAliveStopRef.current?.();
    keepAliveStopRef.current = null;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    indexRef.current = 0;
    if (mountedRef.current) {
      setStatus("idle");
      setSpeechError(null);
    }
  }, [clearStartTimer]);

  useEffect(() => {
    stop();
  }, [fullText, stop]);

  const prepareVoices = useCallback(() => {
    if (!isSpeechSupported()) return;
    voicesRef.current = warmSpeechVoices();
  }, []);

  const play = useCallback(() => {
    if (!isSpeechSupported()) {
      setStatus("unsupported");
      return;
    }
    const trimmed = fullText.trim();
    if (!trimmed) return;

    setSpeechError(null);
    voicesRef.current = warmSpeechVoices();

    window.speechSynthesis.cancel();
    queueRef.current = chunkSpeechText(trimmed);
    indexRef.current = 0;
    if (queueRef.current.length === 0) return;

    keepAliveStopRef.current?.();
    keepAliveStopRef.current = startSpeechKeepAlive();
    setStatus("playing");

    speakNext();
  }, [fullText, speakNext]);

  const pause = useCallback(() => {
    if (!isSpeechSupported()) return;
    window.speechSynthesis.pause();
    if (mountedRef.current) setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (!isSpeechSupported()) return;
    window.speechSynthesis.resume();
    if (mountedRef.current) setStatus("playing");
  }, []);

  const togglePlayPause = useCallback(() => {
    if (status === "playing") pause();
    else if (status === "paused") resume();
    else play();
  }, [status, pause, resume, play]);

  return {
    status,
    speechError,
    prepareVoices,
    play,
    pause,
    resume,
    stop,
    togglePlayPause,
  };
}
