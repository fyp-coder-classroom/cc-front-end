import API from "./api";
import type { Submission, CreateSubmissionBody, GradeSubmissionBody } from "../types/submission";

// Student - submit code
// POST /api/v1/submission
export const submitAssignmentAPI = async (
  body: CreateSubmissionBody
): Promise<Submission> => {
  const { data } = await API.post("/submission", body);
  return data.data;
};

// Student - watch submission
// GET /api/v1/submission/my/:assignmentId
export const getMySubmissionAPI = async (
  assignmentId: string
): Promise<Submission | null> => {
  try {
    const { data } = await API.get(`/submission/my/${assignmentId}`);
    return data.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

// Teacher - all assignment submissions
// GET /api/v1/submission/assignment/:assignmentId
export const getSubmissionsByAssignmentAPI = async (
  assignmentId: string
): Promise<Submission[]> => {
  const { data } = await API.get(`/submission/assignment/${assignmentId}`);
  return data.data;
};

// Both - single submission by ID
// GET /api/v1/submission/:submissionId
export const getSubmissionByIdAPI = async (
  submissionId: string
): Promise<Submission> => {
  const { data } = await API.get(`/submission/${submissionId}`);
  return data.data;
};

// Teacher - grade submission
// PUT /api/v1/submission/:submissionId/grade
export const gradeSubmissionAPI = async (
  submissionId: string,
  body:         GradeSubmissionBody
): Promise<Submission> => {
  const { data } = await API.put(`/submission/${submissionId}/grade`, body);
  return data.data;
};

// Teacher - delete submission
// DELETE /api/v1/submission/:submissionId
export const deleteSubmissionAPI = async (submissionId: string): Promise<void> => {
  try {
    await API.delete(`/submission/${submissionId}`);
  } catch (err: any) {
    if (err?.response?.status === 204) return;
    throw err;
  }
};