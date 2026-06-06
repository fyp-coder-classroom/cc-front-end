// ─────────────────────────────────────────────
// data/mockData.ts
// All static data with full TypeScript types.
// Replace exports with real API calls when ready.
// ─────────────────────────────────────────────

import type {
  StatCardData,
  ActivityItem,
  PendingReview,
  TopPerformer,
  TeacherClass,
  Assignment,
  PendingAssignment,
  StudentClassRow,
  StudentCourse,
  FeatureItem,
  RoleInfo,
} from "../types";

// ── Teacher ──────────────────────────────────

export const TEACHER_STATS: StatCardData[] = [
  { label: "Total Classes",      value: "3",  sub: "↑ 1 from last semester" },
  { label: "Total Students",     value: "47", sub: "Across all classes" },
  { label: "Active Assignments", value: "8",  sub: "3 due this week" },
  { label: "Pending Reviews",    value: "5",  sub: "Needs attention", accent: true },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { dot: "bg-green-400",  text: "Ali Hassan submitted Loop Practice — CS-A",  time: "1m ago"  },
  { dot: "bg-gray-400",   text: "You created Arrays & Pointers assignment",    time: "8m ago"  },
  { dot: "bg-blue-400",   text: "Sara Khan joined class CS-B",                 time: "15m ago" },
  { dot: "bg-yellow-400", text: "Hamid Raza resubmitted Functions Task",       time: "38m ago" },
  { dot: "bg-purple-400", text: "Mudasar submitted Recursion — CS-C",          time: "1h ago"  },
];

export const PENDING_REVIEWS: PendingReview[] = [
  { student: "Ali Hassan",     assignment: "Loop Practice",    class: "CS-A", submitted: "2 mins ago", status: "Pending"  },
  { student: "Hamid Raza",     assignment: "Functions Task",   class: "CS-A", submitted: "3 hrs ago",  status: "Reviewed" },
  { student: "Mudasar Farooq", assignment: "Recursion Basics", class: "CS-C", submitted: "5 hrs ago",  status: "Pending"  },
];

export const TOP_PERFORMERS: TopPerformer[] = [
  { rank: 1, initials: "AH", name: "Ali Hassan",     pts: 96, color: "bg-yellow-400" },
  { rank: 2, initials: "SK", name: "Sara Khan",      pts: 91, color: "bg-gray-400"   },
  { rank: 3, initials: "MF", name: "Mudasar Farooq", pts: 88, color: "bg-orange-400" },
  { rank: 4, initials: "HR", name: "Hamid Raza",     pts: 85, color: "bg-blue-400"   },
  { rank: 5, initials: "UB", name: "Umar Bilal",     pts: 79, color: "bg-purple-400" },
];

export const TEACHER_CLASSES: TeacherClass[] = [
  {
    title: "Introduction to C++",
    desc: "Core programming fundamentals using C++. Covers variables, loops, functions, and arrays.",
    students: 18, assignments: 3, code: "ABC123",
  },
  {
    title: "Data Structures",
    desc: "Advanced programming with linked lists, stacks, queues, and trees using C++.",
    students: 21, assignments: 4, code: "XYZ789",
  },
  {
    title: "OOP Concepts",
    desc: "Object-oriented programming: classes, inheritance, polymorphism, and encapsulation.",
    students: 6, assignments: 1, code: "OOP456",
  },
];

export const SUBMISSION_ACTIVITY_BARS: number[] = [40, 65, 35, 80, 55, 70, 45];
export const SUBMISSION_DAYS: string[]           = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const CLASS_AVG_BARS: number[]            = [65, 80, 55, 90, 45, 70];
export const CLASS_AVG_LABELS: string[]          = ["A1", "A2", "A3", "A4", "A5", "A6"];

// ── Student ──────────────────────────────────

export const STUDENT_STATS: StatCardData[] = [
  { label: "Enrolled Classes",   value: "3",   sub: "All currently" },
  { label: "Total Assignments",  value: "18",  sub: "Across all classes" },
  { label: "Submitted",          value: "14",  sub: "4 this week" },
  { label: "Avg. Score",         value: "78%", sub: "+9.5% from last week", accent: true },
];

export const PENDING_ASSIGNMENTS: PendingAssignment[] = [
  {
    id: "Assignment 07", badge: "Past Due",
    title: "Binary Search Tree Implementation",
    desc: "Implement a BST with insert, delete, and search operations. Test with at least 10 nodes.",
    deadline: "Apr 13, 2026", status: "Not Started", deadlineRed: true, progress: 0,
  },
  {
    id: "Assignment 08", badge: "In Progress",
    title: "Merge Sort & Quick Sort",
    desc: "Implement both sorting algorithms, analyze time complexity, and compare their performance.",
    deadline: "Apr 18, 2026", status: "In Progress", deadlineRed: false, progress: 55,
  },
  {
    id: "Assignment 09", badge: "Graded",
    title: "Fibonacci & Recursion",
    desc: "Implement recursive and iterative Fibonacci, compare performance, and write analysis comments.",
    deadline: "", status: "Submitted", score: "65/100", deadlineRed: false, progress: 100,
  },
];

export const STUDENT_CLASSES_TABLE: StudentClassRow[] = [
  { name: "Data Structures & Algorithms", teacher: "Prof. Usman Ahmad", assignments: "5 of 5", progress: 100, code: "DS-0005" },
  { name: "Object Oriented Programming",  teacher: "Prof. Usman Ahmad", assignments: "7 of 7", progress: 51,  code: "OOP-16"  },
  { name: "Introduction to Programming",  teacher: "Prof. Usman Ahmad", assignments: "6 of 6", progress: 60,  code: "IP-348"  },
];

export const STUDENT_COURSES: StudentCourse[] = [
  {
    title: "Introduction to C++",
    desc: "Core programming fundamentals using C++. Covers variables, loops, functions, and arrays.",
    assignments: 3, pending: 1, prof: "Prof. Gulzar Ahmad", progress: 80,
  },
  {
    title: "Data Structures",
    desc: "Advanced programming with linked lists, stacks, queues, and trees using C++.",
    assignments: 4, pending: 2, prof: "Prof. Usman Ahmad", progress: 60,
  },
];

export const ASSIGNMENTS_CS_A: Assignment[] = [
  { name: "Arrays & Pointers",    assigned: "Apr 13", deadline: "Apr 20", score: "—",        status: "Not Started" },
  { name: "Loop Practice",        assigned: "Apr 8",  deadline: "Apr 15", score: "—",        status: "In Progress" },
  { name: "Functions Task",       assigned: "Apr 1",  deadline: "Apr 7",  score: "98 / 100", status: "Graded"      },
];

export const ASSIGNMENTS_CS_B: Assignment[] = [
  { name: "Linked List Ops",      assigned: "Apr 11", deadline: "Apr 18", score: "—",        status: "Not Started" },
  { name: "Recursion Basics",     assigned: "Apr 5",  deadline: "Apr 10", score: "—",        status: "Submitted"   },
  { name: "Stack Implementation", assigned: "Mar 28", deadline: "Apr 5",  score: "91 / 100", status: "Graded"      },
];

// ── Landing Page ─────────────────────────────

export const FEATURES: FeatureItem[] = [
  { title: "Classroom Management",    desc: "Organize classes and student rosters. Add assignments per class, monitor work per student." },
  { title: "Built-In Code Editor",    desc: "Students submit work directly in the browser. No installs, no setup." },
  { title: "Grade/Review Management", desc: "Review submissions and add grades in one dashboard." },
  { title: "Performance Analytics",   desc: "Track class distributions, assignment scores, and student progress over time." },
  { title: "Email Notifications",     desc: "Automatic alerts when assignments are posted, graded, or deadlines approach." },
  { title: "Role-Based Access",       desc: "Students and teachers see only what they need. Secure access for every role." },
];

export const ROLES_INFO: RoleInfo[] = [
  {
    role: "Teacher",
    desc: "Create classrooms, manage students, and grade assignments all in one place.",
    perks: ["Create and manage multiple classes", "Review and grade code submissions", "Track student performance analytics"],
    cta: "Start Teaching",
  },
  {
    role: "Student",
    desc: "Join classes with a code, submit assignments, and monitor your progress.",
    perks: ["Join classes instantly with a code", "Submit assignments in-browser", "Get graded results and feedback"],
    cta: "Start Learning",
  },
];
