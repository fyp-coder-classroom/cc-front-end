import { type FC } from "react";
import Editor from "@monaco-editor/react";
import type { SupportedLanguage } from "../../types/code";

const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  javascript: "javascript",
  python: "python",
  cpp: "cpp",
};

interface Props {
  language:  SupportedLanguage;
  value:     string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?:   string;
}

const CodeEditor: FC<Props> = ({
  language,
  value,
  onChange,
  readOnly = false,
  height = "400px",
}) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700">
      <Editor
        height={height}
        language={MONACO_LANGUAGE_MAP[language]}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
};

export default CodeEditor;