import { useState, useRef, useEffect, type FC } from "react";
import { useTheme } from "../../theme/useTheme";
import { themeMetadata } from "../../theme/theme";
import type { ThemeName } from "../../theme/theme";

const ThemePicker: FC = () => {
  const { theme, applyTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-surface-raised transition-colors text-xs text-text-muted hover:text-text"
        title="Change theme"
      >
        {/* Current swatch */}
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: themeMetadata[theme].swatch }}
        />
        <span className="hidden sm:block">{themeMetadata[theme].label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-border-strong rounded-xl overflow-hidden shadow-lg z-50">
          {(Object.keys(themeMetadata) as ThemeName[]).map((name) => (
            <button
              key={name}
              onClick={() => {
                applyTheme(name);
                setOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-xs transition-colors
                ${
                  theme === name
                    ? "bg-surface-raised text-text"
                    : "text-text-muted hover:bg-surface-raised hover:text-text"
                }
              `}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: themeMetadata[name].swatch }}
              />
              {themeMetadata[name].label}
              {theme === name && (
                <svg
                  className="w-3 h-3 ml-auto text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
