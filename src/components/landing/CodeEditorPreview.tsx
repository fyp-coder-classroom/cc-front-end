import { useEffect, useRef, useState, type FC } from "react";

const CODE_LINES = [
  "#include <iostream>",
  "using namespace std;",
  "",
  "int main() {",
  "  int arr[] = {1, 2, 3, 4, 5};",
  "  int *ptr = arr;",
  "",
  "  for(int i = 0; i < 5; i++) {",
  '    cout << *(ptr + i) << " ";',
  "  }",
  "  return 0;",
  "}",
];

const FULL_CODE = CODE_LINES.join("\n");

const useTypewriter = () => {
  const [displayed, setDisplayed] = useState("");
  const directionRef = useRef<"forward" | "backward">("forward");
  const indexRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      const dir = directionRef.current;
      if (dir === "forward") {
        if (indexRef.current < FULL_CODE.length) {
          indexRef.current += 1;
          setDisplayed(FULL_CODE.slice(0, indexRef.current));
        } else {
          setTimeout(() => {
            directionRef.current = "backward";
          }, 1800);
          return;
        }
      } else {
        if (indexRef.current > 0) {
          indexRef.current -= 1;
          setDisplayed(FULL_CODE.slice(0, indexRef.current));
        } else {
          setTimeout(() => {
            directionRef.current = "forward";
          }, 600);
          return;
        }
      }
    };
    const delay = directionRef.current === "forward" ? 38 : 18;
    const timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [displayed]);

  return displayed;
};

// Cursor blinks via a <style> tag - no Tailwind config needed
const CURSOR_STYLE = `
  @keyframes cc-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  .cc-cursor {
    animation: cc-blink 1s step-end infinite;
  }
`;

const CodeEditorPreview: FC = () => {
  const code = useTypewriter();

  return (
    <>
      <style>{CURSOR_STYLE}</style>
      <div className="bg-editor-bg rounded-2xl p-5 shadow-2xl border border-[rgba(255,255,255,0.08)]">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 text-text-muted text-xs">
            main.cpp — Arrays &amp; Pointers
          </span>
        </div>

        {/* Code */}
        <pre className="text-xs text-green-400 font-mono leading-relaxed overflow-x-auto min-h-[220px] whitespace-pre-wrap">
          {code}
          <span className="cc-cursor inline-block w-[7px] h-[13px] bg-green-400 ml-0.5 align-middle" />
        </pre>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[#8c8a9a] text-xs">Output: 1 2 3 4 5</span>

          <span className="text-green-400 text-xs font-medium">✓ Compiled</span>
        </div>
      </div>
    </>
  );
};

export default CodeEditorPreview;
