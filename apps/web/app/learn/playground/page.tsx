'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition, useSpeechSynthesis } from '@ai-2dor/core';
import { useVoiceStore } from '../../../src/store/voice';
import type { TutorRequest, TutorResponse } from '../../../src/lib/tutor/types';

interface PlaygroundState {
  code: string;
  isRunning: boolean;
  result: string;
  lastAction?: 'run' | 'explain';
}

const STORAGE_KEY = 'ai-tudor-playground';

export default function PlaygroundPage() {
  const [state, setState] = useState<PlaygroundState>({
    code: '',
    isRunning: false,
    result: ''
  });

  const { voice, setVoiceEnabled } = useVoiceStore();
  const lastSpokenResult = useRef<string>('');

  const speechRecognition = useSpeechRecognition({
    lang: voice.lang,
    onResult: (transcript) => {
      setState(prev => ({ ...prev, code: prev.code + transcript + '\n' }));
    }
  });

  const speechSynthesis = useSpeechSynthesis({
    lang: voice.lang,
    rate: voice.rate
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setState(prev => ({ ...prev, code: data.code || '', result: data.result || '' }));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Autosave to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        code: state.code,
        result: state.result
      }));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state.code, state.result]);

  const callTutor = useCallback(async (action: 'run' | 'explain') => {
    if (!state.code.trim()) {
      setState(prev => ({ ...prev, result: 'Please enter some code first.' }));
      return;
    }

    setState(prev => ({ ...prev, isRunning: true, lastAction: action }));

    try {
      const request: TutorRequest = {
        message: action === 'run' ? 'Run this code' : 'Explain this code',
        code: state.code,
        action
      };

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Failed to call tutor API');
      }

      const data: TutorResponse = await response.json();

      const formattedResult = [
        `**${action === 'run' ? 'Execution' : 'Explanation'} Result:**`,
        data.reply,
        '',
        data.steps.length > 0 ? '**Steps:**' : '',
        ...data.steps.map(step => `• ${step}`),
        data.steps.length > 0 ? '' : '',
        `**Question:** ${data.question}`
      ].filter(Boolean).join('\n');

      setState(prev => ({ ...prev, result: formattedResult }));

      // Speak result if voice enabled and different from last
      if (voice.enabled && speechSynthesis.supported && formattedResult !== lastSpokenResult.current) {
        speechSynthesis.speak(data.reply);
        lastSpokenResult.current = formattedResult;
      }
    } catch (error) {
      const errorMsg = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setState(prev => ({ ...prev, result: errorMsg }));

      if (voice.enabled && speechSynthesis.supported) {
        speechSynthesis.speak(errorMsg);
      }
    } finally {
      setState(prev => ({ ...prev, isRunning: false }));
    }
  }, [state.code, voice.enabled, speechSynthesis]);

  const handleRun = () => callTutor('run');
  const handleExplain = () => callTutor('explain');

  const handleClear = () => {
    setState(prev => ({ ...prev, code: '', result: '' }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-white">AI Tudor Playground</h1>
          <p className="text-slate-400 mt-2">Write code, run it, or get explanations with AI assistance.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Code Editor Panel */}
          <div className="flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 backdrop-blur">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h2 className="text-lg font-medium text-white">Code Editor</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRun}
                  disabled={state.isRunning}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {state.isRunning && state.lastAction === 'run' ? 'Running...' : 'Run'}
                </button>
                <button
                  onClick={handleExplain}
                  disabled={state.isRunning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {state.isRunning && state.lastAction === 'explain' ? 'Explaining...' : 'Explain'}
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Clear
                </button>
                {/* Voice Controls */}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-600">
                  <button
                    onClick={() => speechRecognition.isListening ? speechRecognition.stop() : speechRecognition.start()}
                    disabled={!speechRecognition.supported}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      speechRecognition.isListening
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:opacity-50 text-white'
                    }`}
                    title={speechRecognition.supported ? (speechRecognition.isListening ? 'Stop Recording' : 'Voice Input') : 'Voice not supported'}
                  >
                    🎤
                  </button>
                  <button
                    onClick={() => setVoiceEnabled(!voice.enabled)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      voice.enabled
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                    title={voice.enabled ? 'Disable Voice Output' : 'Enable Voice Output'}
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={state.code}
                onChange={(e) => setState(prev => ({ ...prev, code: e.target.value }))}
                placeholder="// Type your code here...
function hello() {
  console.log('Hello, AI Tudor!');
}

hello();"
                className="w-full h-full bg-slate-950/50 text-white font-mono text-sm p-4 rounded-lg border border-slate-700 focus:border-slate-500 focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 backdrop-blur">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-medium text-white">Output</h2>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {state.result ? (
                <div className="text-slate-200 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {state.result.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <div key={index} className="font-bold text-white mt-4 first:mt-0 mb-2">
                          {line.slice(2, -2)}
                        </div>
                      );
                    }
                    if (line.startsWith('• ')) {
                      return (
                        <div key={index} className="ml-4 text-slate-300">
                          {line}
                        </div>
                      );
                    }
                    return line ? (
                      <div key={index} className="text-slate-200">
                        {line}
                      </div>
                    ) : (
                      <div key={index} className="h-4" />
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-500 italic">
                  Output will appear here after running or explaining code...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}