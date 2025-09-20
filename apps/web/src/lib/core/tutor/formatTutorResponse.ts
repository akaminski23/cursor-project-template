import type { TutorExplainRequestBody, TutorExplainResponse, TutorExplainPayload } from './types';

export interface BuildPromptOptions {
  persona?: string;
}

/**
 * Generates the system prompt for the tutor explain endpoint.
 */
export function buildExplainPrompt(body: TutorExplainRequestBody, options: BuildPromptOptions = {}): string {
  const persona = options.persona ?? 'You are AI 2DoR, a supportive AI fitness coach who teaches programming concepts with actionable movement metaphors.';
  return [
    persona,
    'Return JSON with keys: summary, lineByLine (array), socraticQuestion, exercise.',
    'Keep responses encouraging and concise.',
    body.focus ? `Learning focus: ${body.focus}` : undefined,
    body.language ? `Respond in ${body.language}.` : undefined,
    'Content to explain:',
    body.prompt
  ]
    .filter(Boolean)
    .join('\n\n');
}

function coerceArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry));
  }
  if (typeof value === 'string') {
    return value
      .split(/\n|\r/) // split lines
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Attempts to parse the language model output into the structured payload expected by the UI.
 */
export function formatTutorResponse(raw: string | Partial<TutorExplainResponse>): TutorExplainPayload {
  if (typeof raw === 'object' && raw !== null && 'summary' in raw) {
    return {
      summary: raw.summary ?? '',
      lineByLine: coerceArray(raw.lineByLine),
      socraticQuestion: raw.socraticQuestion ?? '',
      exercise: raw.exercise ?? '',
      raw: JSON.stringify(raw)
    };
  }

  let parsed: Partial<TutorExplainResponse> | undefined;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw) as TutorExplainResponse;
    } catch (error) {
      const fallbackLines = coerceArray(raw);
      return {
        summary: fallbackLines[0] ?? '',
        lineByLine: fallbackLines.slice(1),
        socraticQuestion: 'What part of the code feels least clear right now?',
        exercise: 'Implement a tiny variation of the code and describe what changed.',
        raw
      };
    }
  }

  return {
    summary: parsed?.summary ?? '',
    lineByLine: coerceArray(parsed?.lineByLine),
    socraticQuestion: parsed?.socraticQuestion ?? '',
    exercise: parsed?.exercise ?? '',
    raw: typeof raw === 'string' ? raw : JSON.stringify(raw)
  };
}

/**
 * Provides direct, helpful responses to programming questions.
 */
export function createMockTutorResponse(prompt: string): TutorExplainPayload {
  const lowercasePrompt = prompt.toLowerCase();

  // NPM questions
  if (lowercasePrompt.includes('npm') || lowercasePrompt.includes('node package manager')) {
    return {
      summary: 'NPM to Node Package Manager - narzędzie do zarządzania pakietami JavaScript. NPM pozwala instalować biblioteki z których mogą korzystać inne projekty, publikować własne pakiety i zarządzać zależnościami.',
      lineByLine: [
        '```bash',
        'npm install package-name  # Instaluje pakiet',
        'npm install -g package    # Instaluje globalnie',
        'npm run dev              # Uruchamia script z package.json',
        'npm list                 # Pokazuje zainstalowane pakiety',
        '```'
      ],
      socraticQuestion: '',
      exercise: '',
      raw: JSON.stringify({ prompt, type: 'npm' })
    };
  }

  // Git questions
  if (lowercasePrompt.includes('git') && !lowercasePrompt.includes('github')) {
    return {
      summary: 'Git to system kontroli wersji, który śledzi zmiany w kodzie i umożliwia współpracę w zespole. Pozwala cofać zmiany, tworzyć branche i łączyć kod.',
      lineByLine: [
        '```bash',
        'git status              # Sprawdź stan repozytorium',
        'git add .               # Dodaj wszystkie zmiany',
        'git commit -m "opis"    # Zapisz zmiany z opisem',
        'git push                # Wyślij zmiany na serwer',
        'git pull                # Pobierz najnowsze zmiany',
        '```'
      ],
      socraticQuestion: '',
      exercise: '',
      raw: JSON.stringify({ prompt, type: 'git' })
    };
  }

  // React questions
  if (lowercasePrompt.includes('react') || lowercasePrompt.includes('jsx') || lowercasePrompt.includes('component')) {
    return {
      summary: 'React to biblioteka JavaScript do budowania interfejsów użytkownika. Używa komponentów - funkcji które zwracają JSX (kod przypominający HTML).',
      lineByLine: [
        '```jsx',
        'function Welcome() {',
        '  return <h1>Hello World!</h1>;',
        '}',
        '',
        '// Komponent ze stanem',
        'function Counter() {',
        '  const [count, setCount] = useState(0);',
        '  return (',
        '    <button onClick={() => setCount(count + 1)}>',
        '      Clicked {count} times',
        '    </button>',
        '  );',
        '}',
        '```'
      ],
      socraticQuestion: '',
      exercise: '',
      raw: JSON.stringify({ prompt, type: 'react' })
    };
  }

  // JavaScript questions
  if (lowercasePrompt.includes('javascript') || lowercasePrompt.includes('js') || lowercasePrompt.includes('function')) {
    return {
      summary: 'JavaScript to język programowania działający w przeglądarce i na serwerze (Node.js). Służy do tworzenia interaktywnych stron i aplikacji.',
      lineByLine: [
        '```javascript',
        '// Zmienne',
        'let name = "Adam";',
        'const age = 25;',
        '',
        '// Funkcje',
        'function greet(name) {',
        '  return `Hello, ${name}!`;',
        '}',
        '',
        '// Warunki',
        'if (age >= 18) {',
        '  console.log("Dorosły");',
        '}',
        '```'
      ],
      socraticQuestion: '',
      exercise: '',
      raw: JSON.stringify({ prompt, type: 'javascript' })
    };
  }

  // Error/debugging questions
  if (lowercasePrompt.includes('error') || lowercasePrompt.includes('błąd') || lowercasePrompt.includes('nie działa')) {
    return {
      summary: 'Gdy kod nie działa, najważniejsze to systematyczne debugowanie. Sprawdź konsole w przeglądarce (F12), przeczytaj komunikat błędu i użyj console.log() do sprawdzania wartości.',
      lineByLine: [
        '1. Otwórz konsole przeglądarki (F12 → Console)',
        '2. Przeczytaj komunikat błędu - często wskazuje dokładnie problem',
        '3. Sprawdź czy nie ma literówek w nazwach zmiennych/funkcji',
        '4. Użyj console.log() żeby sprawdzić co się dzieje:',
        '',
        '```javascript',
        'console.log("Sprawdzam zmienną:", myVariable);',
        '```',
        '',
        '5. Sprawdź czy wszystkie importy i pliki są poprawne'
      ],
      socraticQuestion: '',
      exercise: '',
      raw: JSON.stringify({ prompt, type: 'debugging' })
    };
  }

  // Default response
  return {
    summary: 'Jestem AI Code Tutor i pomagam w nauce programowania. Mogę odpowiedzieć na pytania o JavaScript, React, Git, NPM, debugging i inne tematy programistyczne. Zadaj konkretne pytanie a postaram się pomóc!',
    lineByLine: [
      'Przykładowe pytania:',
      '• "Co to jest npm?"',
      '• "Jak działa git?"',
      '• "Jak stworzyć komponent React?"',
      '• "Mam błąd w kodzie, jak go naprawić?"',
      '• "Jak używać funkcji w JavaScript?"'
    ],
    socraticQuestion: '',
    exercise: '',
    raw: JSON.stringify({ prompt, type: 'general' })
  };
}
