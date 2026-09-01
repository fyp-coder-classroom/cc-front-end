import { useRef, type FC } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { SupportedLanguage } from "../../types/code";

const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  javascript: "javascript",
  python: "python",
  cpp: "cpp",
};

interface Props {
  language: SupportedLanguage;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

const CodeEditor: FC<Props> = ({
  language,
  value,
  onChange,
  readOnly = false,
  height = "400px",
}) => {
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.onDidScrollChange(() => {
      const editorScrollTop = editor.getScrollTop();
      const editorScrollHeight = editor.getScrollHeight();
      const editorHeight = editor.getLayoutInfo().height;

      const atTop = editorScrollTop === 0;
      const atBottom = editorScrollTop + editorHeight >= editorScrollHeight - 5;

      const domNode = editor.getDomNode();
      if (!domNode) return;
      if (atTop || atBottom) {
        domNode.style.pointerEvents = "none";
        setTimeout(() => {
          domNode.style.pointerEvents = "auto";
        }, 50);
      }
    });
  };

  return (
    <div
      className="w-full min-w-0 rounded-lg overflow-hidden border border-gray-700"
      onWheel={(e) => {
        if (!editorRef.current) return;
        const editor = editorRef.current;

        const scrollTop = editor.getScrollTop();
        const scrollHeight = editor.getScrollHeight();
        const height = editor.getLayoutInfo().height;

        const atTop = scrollTop === 0 && e.deltaY < 0;
        const atBottom = scrollTop + height >= scrollHeight - 5 && e.deltaY > 0;

        if (atTop || atBottom) {
          // Page scroll 
          window.scrollBy({ top: e.deltaY, behavior: "smooth" });
        }
      }}
    >
      <Editor
        width="100%"
        height={height}
        language={MONACO_LANGUAGE_MAP[language]}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        onMount={handleMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },

          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 6,
            alwaysConsumeMouseWheel: false, 
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;