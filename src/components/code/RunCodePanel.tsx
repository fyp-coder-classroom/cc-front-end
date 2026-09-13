import { useState, type FC } from "react";
import type { SupportedLanguage } from "../../types/code";
import { runCodeAPI } from "../../services/codeService";
import { codeExpectsInput } from "../../utils/detectInput";

interface Props {
  code: string;
  language: SupportedLanguage;
}

const RunCodePanel: FC<Props> = ({ code, language }) => {
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);

  // Set the moment we auto-reveal the box because of a Run click,
  // so we can show a one-line explanation of why it just appeared.
  const [justRevealed, setJustRevealed] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [meta, setMeta] = useState<{
    time: string | null;
    memory: number | null;
  } | null>(null);
  const [runError, setRunError] = useState("");
  const [ranWithStdin, setRanWithStdin] = useState<string[]>([]);

  const toggleStdin = () => {
    setJustRevealed(false);
    setShowStdin((p) => !p);
  };

  const executeRun = async () => {
    setIsRunning(true);
    setRunError("");
    setOutput(null);
    setErrorMsg(null);
    setStatus(null);
    setMeta(null);

    try {
      const result = await runCodeAPI({
        sourceCode: code,
        language,
        stdin: stdin || undefined,
      });
      setOutput(result.output);
      setErrorMsg(result.error);
      setStatus(result.status);
      setIsSuccess(result.isSuccess);
      setMeta({ time: result.executionTime, memory: result.memoryUsed });
      setRanWithStdin(stdin ? stdin.split("\n") : []);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to run code. Please try again.";
      setRunError(msg);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunClick = () => {
    // First click: if the code looks like it reads input and the stdin
    // box isn't open yet, reveal it and stop — give the student a chance
    // to fill it in before we actually hit the backend.
    if (!showStdin && codeExpectsInput(code, language)) {
      setShowStdin(true);
      setJustRevealed(true);
      return;
    }
    // Either input isn't expected, or the box is already open (student
    // already had their chance to fill it in) - proceed with the real run.
    executeRun();
  };

  const hasOutput = output !== null || errorMsg !== null || runError;

  return (
    <div>
      <div className="mb-3">
        <button
          onClick={toggleStdin}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {showStdin ? "-Hide" : "+ Add"} input (stdin)
        </button>
        {showStdin && (
          <>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={3}
              placeholder="One value per line, in the order your program reads them (e.g. cin >>, input())"
              className="w-full mt-2 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
            />
            {justRevealed && (
              <p className="text-[11px] text-yellow-500/80 mt-1">
                This program looks like it reads input - add it above, then hit
                Run again. (If it reads inside a loop, make sure you've included
                enough lines.)
              </p>
            )}
          </>
        )}
      </div>

      <button
        onClick={handleRunClick}
        disabled={isRunning || !code.trim()}
        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      >
        {isRunning ? (
          <>
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Running...
          </>
        ) : (
          <>▶ Run Code</>
        )}
      </button>

      {hasOutput && (
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden font-mono text-xs">
          {/* Terminal chrome — matches CodeEditorPreview's aesthetic */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-800 bg-[#111]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            {status && (
              <span
                className={`ml-auto px-2 py-0.5 rounded text-[11px] font-medium ${
                  isSuccess
                    ? "bg-green-900 text-green-300 border border-green-700"
                    : "bg-red-900 text-red-300 border border-red-700"
                }`}
              >
                {status}
              </span>
            )}
            {meta && (meta.time || meta.memory) && (
              <span className="text-gray-500 text-[11px]">
                {meta.time && `${meta.time}s`}
                {meta.time && meta.memory && " · "}
                {meta.memory && `${meta.memory} KB`}
              </span>
            )}
          </div>

          <div className="p-4">
            {runError && <p className="text-red-400">{runError}</p>}

            {ranWithStdin.length > 0 && (
              <div className="mb-2">
                {ranWithStdin.map((line, i) => (
                  <div key={i} className="text-gray-500">
                    <span className="text-gray-600">{">"} </span>
                    {line}
                  </div>
                ))}
              </div>
            )}

            {output && (
              <pre className="text-white whitespace-pre-wrap break-words mb-2">
                {output}
              </pre>
            )}
            {errorMsg && (
              <pre className="text-red-400 whitespace-pre-wrap break-words">
                {errorMsg}
              </pre>
            )}
            {!output && !errorMsg && !runError && status && (
              <p className="text-gray-500">No output.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RunCodePanel;
