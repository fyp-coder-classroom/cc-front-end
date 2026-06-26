import API from "./api";
import type {
  Classroom,
  CreateClassroomBody,
  JoinClassroomBody,
} from "../types/classroom";

// Teacher - get all classrooms 
export const getTeacherClassroomsAPI = async (): Promise<Classroom[]> => {
  const { data } = await API.get("/classrooms/teacher/my-classrooms");
  return data.data;
};

// Teacher - create classroom 
export const createClassroomAPI = async (
  body: CreateClassroomBody,
): Promise<Classroom> => {
  const { data } = await API.post("/classrooms", body);
  return data.data;
};

// Teacher - delete classroom 
export const deleteClassroomAPI = async (id: string): Promise<void> => {
  await API.delete(`/classrooms/${id}`);
};

// Student - get joined classrooms 
export const getStudentClassroomsAPI = async (): Promise<Classroom[]> => {
  const { data } = await API.get("/classrooms/student/my-classrooms");
  return data.data;
};

//  Student - join classroom 
export const joinClassroomAPI = async (
  body: JoinClassroomBody,
): Promise<Classroom> => {
  const { data } = await API.post("/classrooms/join", body);
  return data.data;
};

//  Both - single classroom detail 
export const getClassroomByIdAPI = async (id: string): Promise<Classroom> => {
  const { data } = await API.get(`/classrooms/${id}`);
  return data.data;
};

//  Teacher - remove student from classroom 
// Backend route: DELETE /classrooms/:classroomId/students/:studentId
export const removeStudentFromClassroomAPI = async (
  classroomId: string,
  studentId:   string
): Promise<void> => {
  try {
    await API.delete(`/classrooms/${classroomId}/students/${studentId}`);
  } catch (err: any) {
    if (err?.response?.status === 204) return;
    throw err;
  }
};