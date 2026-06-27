// Backend routes (nested under classroom — mounted in app.ts as):
//   POST   /api/classrooms/:classroomId/assignments
//   GET    /api/classrooms/:classroomId/assignments
//   GET    /api/classrooms/:classroomId/assignments/:assignmentId
//   PATCH  /api/classrooms/:classroomId/assignments/:assignmentId
//   DELETE /api/classrooms/:classroomId/assignments/:assignmentId  (204 No Content)

import API from "./api";
import type {
  Assignment,
  CreateAssignmentBody,
  UpdateAssignmentBody,
} from "../types/assignment";

//  Teacher create assignment
export const createAssignmentAPI = async (
  classroomId: string,
  body: CreateAssignmentBody,
): Promise<Assignment> => {
  const { data } = await API.post(`/classroom/${classroomId}/assignment`, body);
  return data.data;
};

//  Both  get all assignments in a classroom
export const getAssignmentsByClassroomAPI = async (
  classroomId: string,
): Promise<Assignment[]> => {
  const { data } = await API.get(`/classroom/${classroomId}/assignment`);
  return data.data;
};

//  Both - get single assignment
export const getAssignmentByIdAPI = async (
  classroomId: string,
  assignmentId: string,
): Promise<Assignment> => {
  const { data } = await API.get(
    `/classroom/${classroomId}/assignment/${assignmentId}`,
  );
  return data.data;
};

//  Teacher - update assignment
export const updateAssignmentAPI = async (
  classroomId: string,
  assignmentId: string,
  body: UpdateAssignmentBody,
): Promise<Assignment> => {
  const { data } = await API.patch(
    `/classroom/${classroomId}/assignment/${assignmentId}`,
    body,
  );
  return data.data;
};

//  Teacher - delete assignment (204 No Content)
export const deleteAssignmentAPI = async (
  classroomId: string,
  assignmentId: string,
): Promise<void> => {
  await API.delete(`/classroom/${classroomId}/assignment/${assignmentId}`);
};
