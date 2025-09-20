'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VoiceSettings {
  enabled: boolean;
  lang: 'pl-PL' | 'en-US';
  rate: number;
  pitch: number;
}

interface VoiceStore {
  voice: VoiceSettings;
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceLang: (lang: VoiceSettings['lang']) => void;
  setVoiceRate: (rate: number) => void;
  setVoicePitch: (pitch: number) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
}

export const useVoiceStore = create<VoiceStore>()(
  persist(
    (set) => ({
      voice: {
        enabled: true,
        lang: 'en-US',
        rate: 1.0,
        pitch: 1.0
      },
      setVoiceEnabled: (enabled) =>
        set((state) => ({
          voice: { ...state.voice, enabled }
        })),
      setVoiceLang: (lang) =>
        set((state) => ({
          voice: { ...state.voice, lang }
        })),
      setVoiceRate: (rate) =>
        set((state) => ({
          voice: { ...state.voice, rate: Math.max(0.1, Math.min(3.0, rate)) }
        })),
      setVoicePitch: (pitch) =>
        set((state) => ({
          voice: { ...state.voice, pitch: Math.max(0.1, Math.min(2.0, pitch)) }
        })),
      updateVoiceSettings: (settings) =>
        set((state) => ({
          voice: { ...state.voice, ...settings }
        }))
    }),
    {
      name: 'ai-tudor-voice'
    }
  )
);