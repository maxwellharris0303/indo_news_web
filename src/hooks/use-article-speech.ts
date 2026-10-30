"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chunkSpeechText } from "@/lib/article/speech-text";

export type ArticleSpeechStatus =
  | "unsupported"
  | "idle"
  | "playing"
  | "paused";

function pickIndonesianVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  const id = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith("id") ||
      v.name.toLowerCase().includes("indonesia"),
  );
  return id ?? voices.find((v) => v.lang.toLowerCase().startsWith("id"));
}

export function useArticleSpeech(fullText: string) {
  const [status, setStatus] = useState<ArticleSpeechStatus>("idle");
  const queueRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("unsupported");
      return () => {
        mountedRef.current = false;
      };
    }
    setStatus("idle");
    return () => {
      mountedRef.current = false;
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakNext = useCallback(() => {
    const synth = window.speechSynthesis;
    const queue = queueRef.current;
    const i = indexRef.current;
    if (i >= queue.length) {
      queueRef.current = [];
      indexRef.current = 0;
      if (mountedRef.current) setStatus("idle");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(queue[i]);
    utterance.lang = "id-ID";
    const voices = synth.getVoices();
    const voice = pickIndonesianVoice(voices);
    if (voice) utterance.voice = voice;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      indexRef.current += 1;
      speakNext();
    };
    utterance.onerror = () => {
      if (mountedRef.current) setStatus("idle");
      queueRef.current = [];
      indexRef.current = 0;
    };

    synth.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    indexRef.current = 0;
    if (mountedRef.current) setStatus("idle");
  }, []);

  useEffect(() => {
    stop();
  }, [fullText, stop]);

  const play = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("unsupported");
      return;
    }
    const trimmed = fullText.trim();
    if (!trimmed) return;

    window.speechSynthesis.cancel();
    queueRef.current = chunkSpeechText(trimmed);
    indexRef.current = 0;
    if (queueRef.current.length === 0) return;

    setStatus("playing");

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speakNext();
      };
    } else {
      speakNext();
    }
  }, [fullText, speakNext]);

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    if (mountedRef.current) setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.resume();
    if (mountedRef.current) setStatus("playing");
  }, []);

  const togglePlayPause = useCallback(() => {
    if (status === "playing") pause();
    else if (status === "paused") resume();
    else play();
  }, [status, pause, resume, play]);

  return { status, play, pause, resume, stop, togglePlayPause };
}
