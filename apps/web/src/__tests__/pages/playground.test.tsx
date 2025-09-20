import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlaygroundPage from '../../../app/learn/playground/page';

// Mock speech APIs
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
    supported: true
  }
});

// Mock the core hooks
vi.mock('@ai-2dor/core', () => ({
  useSpeechRecognition: () => ({
    transcript: '',
    isListening: false,
    supported: true,
    start: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn()
  }),
  useSpeechSynthesis: () => ({
    supported: true,
    speak: vi.fn(),
    cancel: vi.fn()
  })
}));

// Mock the voice store
vi.mock('../../../src/store/voice', () => ({
  useVoiceStore: () => ({
    voice: {
      enabled: true,
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.0
    },
    setVoiceEnabled: vi.fn()
  })
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('PlaygroundPage', () => {
  it('should render main elements', () => {
    render(<PlaygroundPage />);

    expect(screen.getByText('AI Tudor Playground')).toBeInTheDocument();
    expect(screen.getByText(/Write code, run it, or get explanations/)).toBeInTheDocument();
  });

  it('should render code editor and output panels', () => {
    render(<PlaygroundPage />);

    expect(screen.getByText('Code Editor')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type your code here/)).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<PlaygroundPage />);

    expect(screen.getByRole('button', { name: /Run/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explain/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
  });

  it('should render voice control buttons', () => {
    render(<PlaygroundPage />);

    // Voice controls should be present (emoji buttons)
    const buttons = screen.getAllByRole('button');
    const voiceButtons = buttons.filter(btn =>
      btn.textContent === '🎤' || btn.textContent === '🔊'
    );

    expect(voiceButtons).toHaveLength(2);
  });

  it('should show default output message', () => {
    render(<PlaygroundPage />);

    expect(screen.getByText(/Output will appear here after running/)).toBeInTheDocument();
  });
});