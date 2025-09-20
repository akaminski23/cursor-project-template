'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseSpeechSynthesisOptions {
  /** Preferred voice name when available. */
  voiceName?: string;
  /** Preferred language tag (e.g. `en-US`). */
  lang?: string;
  /** Playback rate. */
  rate?: number;
}

export interface UseSpeechSynthesis {
  speak: (text: string) => void;
  cancel: () => void;
  speaking: boolean;
  voices: SpeechSynthesisVoice[];
  supported: boolean;
}

/**
 * Small helper around the Web Speech synthesis API.
 */
export function useSpeechSynthesis({ voiceName, lang, rate = 1 }: UseSpeechSynthesisOptions = {}): UseSpeechSynthesis {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;

    const synthesis = window.speechSynthesis;
    const updateVoices = () => setVoices(synthesis.getVoices());

    updateVoices();
    synthesis.addEventListener('voiceschanged', updateVoices);

    return () => synthesis.removeEventListener('voiceschanged', updateVoices);
  }, [supported]);

  const selectedVoice = useMemo(() => {
    if (!voices.length) return undefined;
    if (voiceName) {
      return voices.find((voice) => voice.name === voiceName);
    }
    if (lang) {
      return voices.find((voice) => voice.lang === lang);
    }
    return voices[0];
  }, [voices, voiceName, lang]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) utterance.voice = selectedVoice;
      if (lang) utterance.lang = lang;
      utterance.rate = rate;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [supported, selectedVoice, lang, rate]
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { speak, cancel, speaking, voices, supported };
}
