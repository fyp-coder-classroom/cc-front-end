export interface SubmissionStudent {
  id:    string;
  name:  string;
  email: string;
}

export interface Submission {
  id:           string;
  studentId:    SubmissionStudent | string;
  assignmentId: string;
  code:         string;
  submittedAt:  string;
  isLate:       boolean;
  marks?:       number | null;
  feedback?:    string | null;
  gradedAt?:    string | null;
  gradedBy?:    SubmissionStudent | string | null;
  createdAt?:   string;
  updatedAt?:   string;
}

export interface CreateSubmissionBody {
  assignmentId: string;
  code:         string;
}

export interface GradeSubmissionBody {
  marks:     number;
  feedback?: string;
}