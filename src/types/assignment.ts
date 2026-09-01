export interface Assignment {
  id:          string;
  title:       string;
  statement:   string;
  marks:       number;
  deadline:    string;   // ISO date string
  classroomId: string;
  teacherId:   string;
  createdAt:   string;
  updatedAt:   string;
}

//  Request Bodies 

/** POST /classrooms/:classroomId/assignments */
export interface CreateAssignmentBody {
  title:     string;
  statement: string;
  marks:     number;
  deadline:  string; // ISO string, must be a future date
}

/** PATCH /classrooms/:classroomId/assignments/:assignmentId — all optional, min 1 key */
export interface UpdateAssignmentBody {
  title?:     string;
  statement?: string;
  marks?:     number;
  deadline?:  string;
}
