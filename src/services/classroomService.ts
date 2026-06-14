// Backend routes:
//   GET  /classrooms/teacher/my-classrooms  ← Teacher classrooms
//   GET  /classrooms/student/my-classrooms  ← Student classrooms
//   POST /classrooms                        ← Create
//   POST /classrooms/join                   ← Join
//   DELETE /classrooms/:classroomId         ← Delete
//   GET  /classrooms/:classroomId           ← Detail

import API from "./api";
import type {
  Classroom,
  CreateClassroomBody,
  JoinClassroomBody,
} from "../types/classroom";

//  Teacher - get all classroom
export const getTeacherClassroomsAPI = async (): Promise<Classroom[]> => {
  const { data } = await API.get("/classrooms/teacher/my-classrooms");
  return data.data;
};

// Teacher - create classroom  
export const createClassroomAPI = async (
  body: CreateClassroomBody
): Promise<Classroom> => {
  const { data } = await API.post("/classrooms", body);
  return data.data;
};

//  Teacher - classroom delete  
export const deleteClassroomAPI = async (id: string): Promise<void> => {
  await API.delete(`/classrooms/${id}`);
};

//  Student - joined classrooms 
export const getStudentClassroomsAPI = async (): Promise<Classroom[]> => {
  const { data } = await API.get("/classrooms/student/my-classrooms");
  return data.data;
};

//  Student - join classroom 
export const joinClassroomAPI = async (
  body: JoinClassroomBody
): Promise<Classroom> => {
  const { data } = await API.post("/classrooms/join", body);
  return data.data;
};

//  Both — single classroom detail 
export const getClassroomByIdAPI = async (id: string): Promise<Classroom> => {
  const { data } = await API.get(`/classrooms/${id}`);
  return data.data;
};

// ── Teacher — student remove from classroom 
export const removeStudentFromClassroomAPI = async (
  classroomId: string,
  studentId:   string
): Promise<void> => {
  await API.delete(`/classrooms/${classroomId}/students/${studentId}`);
};