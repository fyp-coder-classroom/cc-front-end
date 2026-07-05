export const themes = {
  dark: {
    background: "#0d0d0f",
    surface: "#18181b",
    surfaceRaised: "#232329",
    surfaceHover: "#2c2c35",

    primary: "#f0eff4",
    primaryHover: "#d4d3dc",
    primaryForeground: "#0d0d0f",

    text: "#f0eff4",
    textSecondary: "#b8b6c8",
    textMuted: "#8c8a9a",
    textFaint: "#4e4c5a",

    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",

    success: "#34d399",
    successBg: "rgba(52,211,153,0.1)",
    successBorder: "rgba(52,211,153,0.2)",

    warning: "#fbbf24",
    warningBg: "rgba(251,191,36,0.1)",

    danger: "#f87171",
    dangerBg: "rgba(248,113,113,0.1)",
    dangerBorder: "rgba(248,113,113,0.3)",
    editorBg: "rgba(58, 58, 56, 0.1)",
  },

  midnight: {
    background: "#0a0e1a",
    surface: "#111827",
    surfaceRaised: "#1a2236",
    surfaceHover: "#1e2a42",

    primary: "#818cf8",
    primaryHover: "#6366f1",
    primaryForeground: "#ffffff",

    text: "#e8eaf6",
    textSecondary: "#9fa8c7",
    textMuted: "#6b7899",
    textFaint: "#3d4663",

    border: "rgba(129,140,248,0.12)",
    borderStrong: "rgba(129,140,248,0.22)",

    success: "#34d399",
    successBg: "rgba(52,211,153,0.1)",
    successBorder: "rgba(52,211,153,0.2)",

    warning: "#fbbf24",
    warningBg: "rgba(251,191,36,0.1)",

    danger: "#f87171",
    dangerBg: "rgba(248,113,113,0.1)",
    dangerBorder: "rgba(248,113,113,0.3)",
    editorBg: "rgba(58, 58, 56, 0.1)",
  },

  slate: {
    background: "#0f1117",
    surface: "#171b26",
    surfaceRaised: "#1f2535",
    surfaceHover: "#262e42",

    primary: "#38bdf8",
    primaryHover: "#0ea5e9",
    primaryForeground: "#0a0e1a",

    text: "#e2eaf7",
    textSecondary: "#93a8c4",
    textMuted: "#607090",
    textFaint: "#374258",

    border: "rgba(56,189,248,0.10)",
    borderStrong: "rgba(56,189,248,0.20)",

    success: "#34d399",
    successBg: "rgba(52,211,153,0.1)",
    successBorder: "rgba(52,211,153,0.2)",

    warning: "#fbbf24",
    warningBg: "rgba(251,191,36,0.1)",

    danger: "#f87171",
    dangerBg: "rgba(248,113,113,0.1)",
    dangerBorder: "rgba(248,113,113,0.3)",
    editorBg: "rgba(58, 58, 56, 0.1)",
  },

  forest: {
    background: "#080f0a",
    surface: "#0e1a11",
    surfaceRaised: "#162419",
    surfaceHover: "#1c2e20",

    primary: "#4ade80",
    primaryHover: "#22c55e",
    primaryForeground: "#080f0a",

    text: "#e8f5ec",
    textSecondary: "#96b89e",
    textMuted: "#5e7d66",
    textFaint: "#2e4a33",

    border: "rgba(74,222,128,0.10)",
    borderStrong: "rgba(74,222,128,0.20)",

    success: "#4ade80",
    successBg: "rgba(74,222,128,0.1)",
    successBorder: "rgba(74,222,128,0.2)",

    warning: "#fbbf24",
    warningBg: "rgba(251,191,36,0.1)",

    danger: "#f87171",
    dangerBg: "rgba(248,113,113,0.1)",
    dangerBorder: "rgba(248,113,113,0.3)",
    editorBg: "rgba(58, 58, 56, 0.1)",
  },

  rose: {
    background: "#0f090c",
    surface: "#1a0f13",
    surfaceRaised: "#26151b",
    surfaceHover: "#301a22",

    primary: "#fb7185",
    primaryHover: "#f43f5e",
    primaryForeground: "#0f090c",

    text: "#f5e6ea",
    textSecondary: "#c49aa6",
    textMuted: "#8a5f6b",
    textFaint: "#4a2f38",

    border: "rgba(251,113,133,0.10)",
    borderStrong: "rgba(251,113,133,0.20)",

    success: "#34d399",
    successBg: "rgba(52,211,153,0.1)",
    successBorder: "rgba(52,211,153,0.2)",

    warning: "#fbbf24",
    warningBg: "rgba(251,191,36,0.1)",

    danger: "#f87171",
    dangerBg: "rgba(248,113,113,0.1)",
    dangerBorder: "rgba(248,113,113,0.3)",
    editorBg: "rgba(58, 58, 56, 0.1)",
  },
  light: {
    background: "#f5f5f7",
    surface: "#ffffff",
    surfaceRaised: "#f0f0f2",
    surfaceHover: "#e8e8ec",

    primary: "#0d0d0f",
    primaryHover: "#232329",
    primaryForeground: "#f5f5f7",

    text: "#0d0d0f",
    textSecondary: "#3d3b4a",
    textMuted: "#6e6c7e",
    textFaint: "#b0afc0",

    border: "rgba(0,0,0,0.08)",
    borderStrong: "rgba(0,0,0,0.14)",

    success: "#16a34a",
    successBg: "rgba(22,163,74,0.08)",
    successBorder: "rgba(22,163,74,0.2)",

    warning: "#d97706",
    warningBg: "rgba(217,119,6,0.08)",

    danger: "#dc2626",
    dangerBg: "rgba(220,38,38,0.08)",
    dangerBorder: "rgba(220,38,38,0.2)",
    editorBg: "#1a1a1a",
  },
} as const;

export type ThemeName = keyof typeof themes;

export const themeMetadata: Record<
  ThemeName,
  { label: string; swatch: string }
> = {
  dark: { label: "Dark", swatch: "#0d0d0f" },
  light: { label: "Light", swatch: "#f0eff4" },
  midnight: { label: "Midnight", swatch: "#818cf8" },
  slate: { label: "Slate", swatch: "#38bdf8" },
  forest: { label: "Forest", swatch: "#4ade80" },
  rose: { label: "Rose", swatch: "#fb7185" },
};
