import { Fragment, memo, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneSpace } from 'react-syntax-highlighter/dist/esm/styles/prism';

type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

export interface ChatMessageListProps {
  messages: ChatMessage[];
  className?: string;
}

interface ContentSegment {
  type: 'text' | 'code';
  value: string;
  language?: string;
}

const CODE_BLOCK_REGEX = /```(\w+)?\n([\s\S]*?)```/g;

function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = CODE_BLOCK_REGEX.exec(content))) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }

    const language = match[1]?.trim() || 'typescript';
    const value = match[2];
    segments.push({ type: 'code', value, language });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) });
  }

  if (!segments.length) {
    segments.push({ type: 'text', value: content });
  }

  return segments;
}

const roleClassMap: Record<MessageRole, string> = {
  user: 'items-end text-right',
  assistant: 'items-start text-left',
  system: 'items-center text-center'
};

function CopyButton({ value }: { value: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(value)}
      className="ml-auto text-xs text-blue-300 hover:text-blue-200"
      aria-label="Copy code to clipboard"
    >
      Copy
    </button>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const segments = parseContent(message.content);

  return (
    <li className={clsx('flex w-full flex-col gap-2', roleClassMap[message.role])}>
      <div
        className={clsx(
          'w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm shadow-lg backdrop-blur',
          message.role === 'user' ? 'rounded-tr-none border-blue-500/40 bg-blue-900/40' : 'rounded-tl-none'
        )}
      >
        {segments.map((segment, index) => (
          <Fragment key={`${message.id}-${index}`}>
            {segment.type === 'text' ? (
              <p className="whitespace-pre-wrap leading-relaxed">{segment.value.trim()}</p>
            ) : (
              <div className="relative">
                <CopyButton value={segment.value} />
                <SyntaxHighlighter
                  language={segment.language}
                  style={duotoneSpace as never}
                  customStyle={{ background: 'transparent', paddingTop: '1.5rem' }}
                  wrapLongLines
                >
                  {segment.value}
                </SyntaxHighlighter>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </li>
  );
}

/**
 * Renders an accessible list of chat messages with syntax highlighted code blocks.
 */
export const ChatMessageList = memo(function ChatMessageList({ messages, className }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={clsx('flex w-full flex-1 items-center justify-center p-8', className)}>
        <p className="text-center text-slate-400">
          Witaj w AI 2DoR! Zadaj pytanie o kod lub programowanie, a ja Ci pomogę.
          <br />
          <span className="text-sm">Przykład: &quot;Nie rozumiem kodu, jakie komendy powinienem znać?&quot;</span>
        </p>
      </div>
    );
  }

  return (
    <ul
      ref={scrollRef}
      className={clsx('flex w-full flex-1 flex-col gap-6 overflow-y-auto p-4 scroll-smooth', className)}
      style={{ scrollBehavior: 'smooth' }}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </ul>
  );
});
