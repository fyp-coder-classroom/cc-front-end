import { useState, type FC } from "react";
import type { SupportedLanguage } from "../../types/code";
import { runCodeAPI } from "../../services/codeService";

interface Props {
  code:     string;
  language: SupportedLanguage;
}

const RunCodePanel: FC<Props> = ({ code, language }) => {
  const [stdin,     setStdin]     = useState("");
  const [showStdin, setShowStdin] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [output,    setOutput]    = useState<string | null>(null);
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);
  const [status,    setStatus]    = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [meta,      setMeta]      = useState<{ time: string | null; memory: number | null } | null>(null);
  const [runError,  setRunError]  = useState("");

  const handleRun = async () => {
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
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to run code. Please try again.";
      setRunError(msg);
    } finally {
      setIsRunning(false);
    }
  };

  const hasOutput = output !== null || errorMsg !== null || runError;

  return (
    <div>
      <div className="mb-3">
        <button
          onClick={() => setShowStdin((p) => !p)}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {showStdin ? "-Hide" : "+ Add"} input (stdin)
        </button>
        {showStdin && (
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={2}
            placeholder="Optional - input your program reads via stdin"
            className="w-full mt-2 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
          />
        )}
      </div>

      <button
        onClick={handleRun}
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
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 font-mono text-xs">
          {status && (
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-800">
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                isSuccess
                  ? "bg-green-900 text-green-300 border border-green-700"
                  : "bg-red-900 text-red-300 border border-red-700"
              }`}>
                {status}
              </span>
              {meta && (meta.time || meta.memory) && (
                <span className="text-gray-500 text-[11px]">
                  {meta.time && `${meta.time}s`}
                  {meta.time && meta.memory && " · "}
                  {meta.memory && `${meta.memory} KB`}
                </span>
              )}
            </div>
          )}

          {runError && <p className="text-red-400">{runError}</p>}
          {output && <pre className="text-white whitespace-pre-wrap break-words mb-2">{output}</pre>}
          {errorMsg && <pre className="text-red-400 whitespace-pre-wrap break-words">{errorMsg}</pre>}
          {!output && !errorMsg && !runError && status && (
            <p className="text-gray-500">No output.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RunCodePanel;