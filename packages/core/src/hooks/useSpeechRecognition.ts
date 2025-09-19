'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface RecognitionResult {
  0?: { transcript?: string };
  isFinal?: boolean;
}

interface RecognitionEvent {
  results: ArrayLike<RecognitionResult>;
}

interface RecognitionErrorEvent {
  error: string;
}

interface RecognitionLike {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  start?: () => void;
  stop: () => void;
  onresult?: (event: RecognitionEvent) => void;
  onerror?: (event: RecognitionErrorEvent) => void;
  onend?: () => void;
}

export interface UseSpeechRecognitionOptions {
  /** Optional locale for recognition. */
  lang?: string;
  /** Optional callback triggered when a transcript is finalized. */
  onResult?: (transcript: string) => void;
  /** Optional fallback endpoint for Whisper transcription. */
  whisperEndpoint?: string;
}

export interface UseSpeechRecognition {
  transcript: string;
  isListening: boolean;
  supported: boolean;
  error?: string;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

type RecognitionConstructor = new () => RecognitionLike;

type SpeechWindow = typeof window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

function getRecognition(): RecognitionLike | undefined {
  if (typeof window === 'undefined') return undefined;
  const speechWindow = window as SpeechWindow;
  const RecognitionImpl = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  if (!RecognitionImpl) return undefined;
  return new RecognitionImpl();
}

/**
 * Provides a thin wrapper around the Web Speech API with a simple Whisper fallback hook.
 */
export function useSpeechRecognition({
  lang = 'en-US',
  onResult,
  whisperEndpoint
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognition {
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const recognition = getRecognition();
    if (recognition) {
      setSupported(true);
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.onresult = (event: RecognitionEvent) => {
        const result = Array.from(event.results)
          .map((entry) => entry?.[0]?.transcript ?? '')
          .join(' ')
          .trim();
        setTranscript(result);
        const lastResult = event.results[event.results.length - 1];
        if (lastResult?.isFinal) {
          onResult?.(result);
        }
      };
      recognition.onerror = (event: RecognitionErrorEvent) => {
        setError(event.error);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, [lang, onResult]);

  const start = useCallback(async () => {
    if (recognitionRef.current?.start) {
      setError(undefined);
      recognitionRef.current.start();
      setIsListening(true);
      return;
    }

    if (whisperEndpoint && typeof window !== 'undefined') {
      setError(undefined);
      setIsListening(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', blob, 'speech.webm');
          const response = await fetch(whisperEndpoint, { method: 'POST', body: formData });
          const data = (await response.json()) as { text?: string };
          const text = data?.text ?? '';
          setTranscript(text);
          onResult?.(text);
          setIsListening(false);
        };
        mediaRecorder.start();
        recognitionRef.current = {
          stop() {
            mediaRecorder.stop();
            stream.getTracks().forEach((track) => track.stop());
          }
        };
      } catch (whisperError) {
        setError(whisperError instanceof Error ? whisperError.message : 'Unknown Whisper error');
        setIsListening(false);
      }
      return;
    }

    setError('Speech recognition is not supported in this browser.');
  }, [onResult, whisperEndpoint]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(undefined);
  }, []);

  return {
    transcript,
    isListening,
    supported,
    error,
    start,
    stop,
    reset
  };
}
