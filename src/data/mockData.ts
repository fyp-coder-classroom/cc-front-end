import type { FeatureItem, RoleInfo } from "../types";

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
    perks: [
      "Create and manage multiple classes",
      "Review and grade code submissions",
      "Track student performance analytics",
    ],
    cta: "Start Teaching",
  },
  {
    role: "Student",
    desc: "Join classes with a code, submit assignments, and monitor your progress.",
    perks: [
      "Join classes instantly with a code",
      "Submit assignments in-browser",
      "Get graded results and feedback",
    ],
    cta: "Start Learning",
  },
];