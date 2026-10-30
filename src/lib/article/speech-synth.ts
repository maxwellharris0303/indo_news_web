/** Browser TTS helpers — Chrome profile / voice-loading quirks. */

export type SpeechStartError = "not-allowed" | "start-failed" | "synthesis-failed";

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Call during pointerdown on the listen control so voices load under user activation. */
export function warmSpeechVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  const synth = window.speechSynthesis;
  synth.getVoices();
  return synth.getVoices();
}

export function pickIndonesianVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;
  const id = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith("id") ||
      v.name.toLowerCase().includes("indonesia"),
  );
  return (
    id ??
    voices.find((v) => v.lang.toLowerCase().startsWith("id")) ??
    voices.find((v) => v.default) ??
    voices[0]
  );
}

export function applyUtteranceVoice(
  utterance: SpeechSynthesisUtterance,
  voices: SpeechSynthesisVoice[],
): void {
  utterance.lang = "id-ID";
  const voice = pickIndonesianVoice(voices);
  if (voice) utterance.voice = voice;
  utterance.rate = 1;
  utterance.pitch = 1;
}

/** Chrome sometimes leaves synthesis paused; nudge while audio should be playing. */
export function startSpeechKeepAlive(): () => void {
  if (!isSpeechSupported()) return () => {};
  const id = window.setInterval(() => {
    const synth = window.speechSynthesis;
    if (!synth.speaking) return;
    if (synth.paused) synth.resume();
  }, 4000);
  return () => window.clearInterval(id);
}

export function mapSpeechError(code: string | undefined): SpeechStartError {
  if (code === "not-allowed" || code === "interrupted") return "not-allowed";
  return "synthesis-failed";
}
