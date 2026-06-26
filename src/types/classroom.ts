export interface ClassroomMember {
  id:    string;
  name:  string;
  email: string;
}

export interface Classroom {
  id:          string;
  name:        string;
  description: string;
  classCode:   string;
  teacherId:   string | ClassroomMember;
  students:    ClassroomMember[] | string[];
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