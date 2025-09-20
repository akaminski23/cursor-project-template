import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../../../app/(app)/page';

// Mock the speech APIs
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
});

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }))
});

// Mock the useTutorChat hook
vi.mock('@/hooks/useTutorChat', () => ({
  useTutorChat: () => ({
    messages: [],
    isLoading: false,
    sendPrompt: vi.fn(),
    error: null
  })
}));

// Mock the UI components
vi.mock('@ai-2dor/ui', () => ({
  ChatComposer: ({ children, ...props }: any) => <div data-testid="chat-composer" {...props}>{children}</div>,
  ChatMessageList: ({ children, ...props }: any) => <div data-testid="chat-message-list" {...props}>{children}</div>
}));

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

// Mock auth
vi.mock('@/lib/auth', () => ({
  getMockUser: () => ({
    id: 'mock-id',
    email: 'test@example.com',
    name: 'Test User'
  })
}));

describe('HomePage', () => {
  it('should render main elements', () => {
    render(<HomePage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('AI 2DoR – AI Code Tutor')).toBeInTheDocument();
    expect(screen.getByText(/Paste code, receive structured breakdowns/)).toBeInTheDocument();
  });

  it('should show user email in header', () => {
    render(<HomePage />);
    expect(screen.getByText(/Signed in as test@example.com/)).toBeInTheDocument();
  });

  it('should render chat interface', () => {
    render(<HomePage />);

    // Should have chat message list and composer
    const chatContainer = screen.getByRole('main').querySelector('.flex.h-\\[60vh\\]');
    expect(chatContainer).toBeInTheDocument();
  });
});