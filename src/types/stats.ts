export interface PerformanceTrend {
  assignmentId: string;
  score:        number;
  submittedAt:  string;
}

export interface PerStudentStats {
  studentId:            string;
  submissionsMade:      number;
  totalAssignments:     number;
  averageScore:         number | null;
  performanceTrend:     PerformanceTrend[];
  notSubmitted:         number;
  missingAssignmentIds: string[];
  gradedCount:          number;
  classRank:            "Above_average" | "Around_average" | "Below_average" | null;
  rankPosition:         number | null;
}

export interface ClassroomStats {
  classroomId:          string;
  totalAssignments:     number;
  classAverageScore:    number | null;
  onTimeSubmissionRate: number | null;
  participationRate:    number | null;
  gradingBacklog:       number;
  perStudent:           PerStudentStats[];
  computedAt:           string;
}

export interface MyStats {
  classroomId:            string;
  studentId:              string;
  mySubmissionsMade:      number;
  myTotalAssignments:     number;
  myAverageScore:         number | null;
  myPerformanceTrend:     PerformanceTrend[];
  myNotSubmitted:         number;
  myMissingAssignmentIds: string[];
  myGradedCount:          number;
  myClassRank:            "Above_average" | "Around_average" | "Below_average" | null;
  myRankPosition:         number | null;
  totalStudents:          number;
  classAverageScore:      number | null;
  computedAt:             string;
}