// ─────────────────────────────────────────────
// components/ui/Icons.tsx
// All reusable SVG icon components.
// Each icon is a React functional component with no props.
// Usage: import { GridIcon, PlusIcon } from '../components/ui/Icons';
// ─────────────────────────────────────────────

import type { FC } from "react";

export const GridIcon: FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1"  y="1"  width="6" height="6" rx="1" fill="currentColor" />
    <rect x="11" y="1"  width="6" height="6" rx="1" fill="currentColor" />
    <rect x="1"  y="11" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="11" y="11" width="6" height="6" rx="1" fill="currentColor" />
  </svg>
);

export const ChevronRight: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PlusIcon: FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const DashboardIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1"   y="1"   width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="9.5" y="1"   width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="1"   y="9.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
  </svg>
);

export const ClassesIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ProfileIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SignOutIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

export const CodeIcon: FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M5 6L2 9l3 3M13 6l3 3-3 3M10 4l-2 10"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

export const CheckIcon: FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
