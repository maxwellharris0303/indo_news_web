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

function isSynthBusy(): boolean {
  if (!isSpeechSupported()) return false;
  const synth = window.speechSynthesis;
  return synth.speaking || synth.pending;
}

export function useArticleSpeech(fullText: string) {
  const [status, setStatus] = useState<ArticleSpeechStatus>("idle");
  const [speechError, setSpeechError] = useState<SpeechStartError | null>(
    null,
  );
  const [synthBusy, setSynthBusy] = useState(false);
  const queueRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const mountedRef = useRef(true);
  const keepAliveStopRef = useRef<(() => void) | null>(null);
  const startTimerRef = useRef<number | null>(null);
  /** Bumps on each play/stop so stale utterance callbacks are ignored. */
  const generationRef = useRef(0);

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
      generationRef.current += 1;
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isSpeechSupported()) return;
    const sync = () => {
      const busy = isSynthBusy();
      setSynthBusy(busy);
      if (!mountedRef.current) return;
      if (busy) {
        const synth = window.speechSynthesis;
        setStatus(synth.paused ? "paused" : "playing");
        setSpeechError(null);
      } else if (
        status === "playing" ||
        status === "paused"
      ) {
        if (queueRef.current.length === 0 && indexRef.current === 0) {
          setStatus("idle");
        }
      }
    };
    sync();
    const id = window.setInterval(sync, 300);
    return () => window.clearInterval(id);
  }, [status]);

  const clearStartTimer = useCallback(() => {
    if (startTimerRef.current != null) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  }, []);

  const speakNext = useCallback(
    (gen: number) => {
      if (gen !== generationRef.current) return;

      const synth = window.speechSynthesis;
      const queue = queueRef.current;
      const i = indexRef.current;
      if (i >= queue.length) {
        queueRef.current = [];
        indexRef.current = 0;
        keepAliveStopRef.current?.();
        keepAliveStopRef.current = null;
        if (mountedRef.current && gen === generationRef.current) {
          setStatus("idle");
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(queue[i]);
      const voices =
        voicesRef.current.length > 0
          ? voicesRef.current
          : warmSpeechVoices();
      applyUtteranceVoice(utterance, voices);

      utterance.onstart = () => {
        if (gen !== generationRef.current) return;
        clearStartTimer();
        if (mountedRef.current) {
          setSpeechError(null);
          setStatus("playing");
        }
      };

      utterance.onend = () => {
        if (gen !== generationRef.current) return;
        indexRef.current += 1;
        speakNext(gen);
      };

      utterance.onerror = (ev) => {
        if (gen !== generationRef.current) return;
        const code = ev.error ?? "";
        if (code === "interrupted" || code === "canceled") return;

        clearStartTimer();
        keepAliveStopRef.current?.();
        keepAliveStopRef.current = null;
        queueRef.current = [];
        indexRef.current = 0;

        if (!mountedRef.current) return;
        if (isSynthBusy()) {
          setSpeechError(null);
          return;
        }
        setSpeechError(mapSpeechError(code));
        setStatus("idle");
      };

      if (synth.paused) synth.resume();
      synth.speak(utterance);

      clearStartTimer();
      startTimerRef.current = window.setTimeout(() => {
        if (gen !== generationRef.current) return;
        if (synth.speaking || synth.pending) return;
        if (queueRef.current.length === 0) return;

        keepAliveStopRef.current?.();
        keepAliveStopRef.current = null;
        queueRef.current = [];
        indexRef.current = 0;
        if (mountedRef.current) {
          setSpeechError("start-failed");
          setStatus("idle");
        }
      }, 1500);
    },
    [clearStartTimer],
  );

  const stop = useCallback(() => {
    if (!isSpeechSupported()) return;
    generationRef.current += 1;
    clearStartTimer();
    keepAliveStopRef.current?.();
    keepAliveStopRef.current = null;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    indexRef.current = 0;
    if (mountedRef.current) {
      setStatus("idle");
      setSpeechError(null);
      setSynthBusy(false);
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

    const gen = generationRef.current + 1;
    generationRef.current = gen;

    window.speechSynthesis.cancel();
    voicesRef.current = warmSpeechVoices();

    queueRef.current = chunkSpeechText(trimmed);
    indexRef.current = 0;
    if (queueRef.current.length === 0) return;

    clearStartTimer();
    keepAliveStopRef.current?.();
    keepAliveStopRef.current = startSpeechKeepAlive();
    setStatus("playing");

    speakNext(gen);
  }, [fullText, speakNext, clearStartTimer]);

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
    if (!isSpeechSupported()) return;
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) {
      if (synth.paused || status === "paused") resume();
      else pause();
      return;
    }
    if (status === "playing") pause();
    else if (status === "paused") resume();
    else play();
  }, [status, pause, resume, play]);

  const isActive =
    status === "playing" || status === "paused" || synthBusy;

  return {
    status,
    isActive,
    speechError,
    prepareVoices,
    play,
    pause,
    resume,
    stop,
    togglePlayPause,
  };
}
