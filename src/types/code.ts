export type SupportedLanguage = "javascript" | "python" | "cpp";

export interface LanguageOption {
  key:   SupportedLanguage;
  label: string;
}

export interface RunCodeBody {
  sourceCode: string;
  language:   SupportedLanguage;
  stdin?:     string;
}

export interface RunCodeResult {
  output:        string | null;
  error:         string | null;
  status:        string;
  isSuccess:     boolean;
  executionTime: string | null;
  memoryUsed:    number | null;
}