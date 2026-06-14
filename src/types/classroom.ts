export interface Classroom {
  _id?:        string;   // MongoDB raw
  id:          string;   // toJSON plugin se aata hai ← YEH HAI REAL ID
  name:        string;
  description: string;
  classCode:   string;
  teacherId:   string | { _id: string; id: string; name: string; email: string };
  students:    { _id: string; id: string; name: string; email: string }[] | string[];
  createdAt:   string;
  updatedAt:   string;
}

export interface CreateClassroomBody {
  name:        string;
  description: string;
}

export interface JoinClassroomBody {
  classCode: string;
}

export interface ClassroomResponse {
  classroom: Classroom;
}

export interface ClassroomsResponse {
  classrooms: Classroom[];
}

export interface ClassroomFormState {
  name:        string;
  description: string;
}

export interface JoinClassroomFormState {
  classCode: string;
}