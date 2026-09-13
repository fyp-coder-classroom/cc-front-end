import type { SupportedLanguage } from "../types/code";

const INPUT_PATTERNS: Record<SupportedLanguage, RegExp[]> = {

  cpp: [ /\bcin\s*>>/, /\bscanf\s*\(/, /\bgetline\s*\(/],

  python: [ /\binput\s*\(/, /sys\s*\.\s*stdin/ ],

  javascript: [ /readline/i, /process\s*\.\s*stdin/, /\bprompt\s*\(/],
};

// Best-effort static check:
// tells you whether the code likely reads stdin.
export const codeExpectsInput = (
  code: string,
  language: SupportedLanguage
): boolean => {
  return INPUT_PATTERNS[language].some((re) => re.test(code));
};

// Detect programming language from submitted code.
// This is used when the submission does not store language separately.
export const detectLanguage = (code: string): SupportedLanguage => {
  const source = code.trim();

  // C++
  if (
    /#include\s*<[^>]+>/.test(source) ||
    /\bstd::/.test(source) ||
    /\bcout\s*<</.test(source) ||
    /\bcin\s*>>/.test(source) ||
    /\busing\s+namespace\s+std\b/.test(source) ||
    /\bint\s+main\s*\(/.test(source)
  ) {
    return "cpp";
  }

  // JavaScript
  if (
    /\bconsole\.log\s*\(/.test(source) ||
    /\bconst\s+\w+\s*=/.test(source) ||
    /\blet\s+\w+\s*=/.test(source) ||
    /\bvar\s+\w+\s*=/.test(source) ||
    /=>/.test(source) ||
    /\brequire\s*\(/.test(source) ||
    /\bprocess\.stdin\b/.test(source)
  ) {
    return "javascript";
  }

  // Python
  if (
    /\bdef\s+\w+\s*\(/.test(source) ||
    /\bprint\s*\(/.test(source) ||
    /\binput\s*\(/.test(source) ||
    /\bimport\s+\w+/.test(source) ||
    /\bfrom\s+\w+\s+import\b/.test(source) ||
    /\belif\b/.test(source) ||
    /\bself\.\w+/.test(source)
  ) {
    return "python";
  }

  // Default
  return "python";
};