/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        "surface-hover": "var(--surface-hover)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-faint": "var(--text-faint)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        "editor-bg": "var(--editor-bg)",
      },
    },
  },
  plugins: [],
};
