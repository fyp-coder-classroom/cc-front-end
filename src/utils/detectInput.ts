import type { SupportedLanguage } from "../types/code";

const INPUT_PATTERNS: Record<SupportedLanguage, RegExp[]> = {
  cpp: [/\bcin\s*>>/, /\bscanf\s*\(/, /\bgetline\s*\(/],
  python: [/\binput\s*\(/, /sys\.stdin/],
  javascript: [/readline/i, /process\.stdin/, /\bprompt\s*\(/],
};

// Best-effort static check: tells you the code LIKELY reads stdin.
// Cannot tell you how many times (loops make the count runtime-dependent),
// so this is only ever used to decide whether to show/expand the stdin box
// and surface a hint — never to render a fixed number of input fields.
export const codeExpectsInput = (
  code: string,
  language: SupportedLanguage,
): boolean => INPUT_PATTERNS[language].some((re) => re.test(code));
