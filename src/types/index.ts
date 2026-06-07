// Import from here: import type { Role, Assignment } from '../types';

// ── Auth Types ────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string; // single field — matches backend
  email: string;
  password: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  name: string; // single field — matches backend
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: AuthUser;
  authTokens: Tokens; // backend key
  tokens?: Tokens; // alias for forward compat
}

export interface Tokens {
  access: { token: string; expires: string | Date };
  refresh: { token: string; expires: string | Date };
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// ── App-Level ─────────────────────────────────

/** Top-level screen the app can show */
export type Screen = "landing" | "signin" | "signup" | "app";

/** Authenticated user role */
export type Role = "student" | "teacher";

/** Active page inside the authenticated app shell */
export type Page = "dashboard" | "classes";

// ── Badge / Status ────────────────────────────

export type BadgeStatus =
  | "Active"
  | "Not Started"
  | "In Progress"
  | "Graded"
  | "Submitted"
  | "Pending"
  | "Reviewed"
  | "Past Due";

// ── Data Models ───────────────────────────────

export interface StatCardData {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}

export interface ActivityItem {
  dot: string; // Tailwind bg color class e.g. "bg-green-400"
  text: string;
  time: string;
}

export interface PendingReview {
  student: string;
  assignment: string;
  class: string;
  submitted: string;
  status: BadgeStatus;
}

export interface TopPerformer {
  rank: number;
  initials: string;
  name: string;
  pts: number;
  color: string; // Tailwind bg color class
}

export interface TeacherClass {
  title: string;
  desc: string;
  students: number;
  assignments: number;
  code: string;
}

export interface Assignment {
  name: string;
  assigned: string;
  deadline: string;
  score: string;
  status: BadgeStatus;
}

export interface PendingAssignment {
  id: string;
  badge: "Past Due" | "In Progress" | "Graded";
  title: string;
  desc: string;
  deadline: string;
  status: string;
  score?: string;
  deadlineRed: boolean;
  progress: number;
}

export interface StudentClassRow {
  name: string;
  teacher: string;
  assignments: string;
  progress: number;
  code: string;
}

export interface StudentCourse {
  title: string;
  desc: string;
  assignments: number;
  pending: number;
  prof: string;
  progress: number;
}

export interface FeatureItem {
  title: string;
  desc: string;
}

export interface RoleInfo {
  role: string;
  desc: string;
  perks: string[];
  cta: string;
}

// ── Component Prop Types ──────────────────────

export interface SidebarProps {
  role: Role;
  activePage: Page;
  setPage: (page: Page) => void;
  onLogout: () => void; // replaces setScreen — calls useAuth().logout()
}

export interface AppShellProps {
  role: Role;
  // setScreen removed — navigation is driven by AuthContext user state
}

export interface AuthPageProps {
  setScreen: (screen: Screen) => void;
  // setRole removed — role comes from AuthContext user.role
}

export interface LandingPageProps {
  setScreen: (screen: Screen) => void;
}

export interface ClassCardProps {
  title: string;
  desc: string;
  meta: string;
  code?: string;
  progress?: number;
  status?: BadgeStatus;
  onClick?: () => void;
}

export interface AssignmentTableProps {
  assignments: Assignment[];
}

export interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}

export interface ProgressBarProps {
  value?: number;
  max?: number;
  color?: string;
}

export interface BadgeProps {
  status: BadgeStatus;
}
