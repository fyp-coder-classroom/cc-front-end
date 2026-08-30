import { useState, useEffect, useCallback } from "react";
import type {
  Submission,
  CreateSubmissionBody,
  GradeSubmissionBody,
} from "../types/submission";
import {
  getMySubmissionAPI,
  submitAssignmentAPI,
  getSubmissionsByAssignmentAPI,
  gradeSubmissionAPI,
  deleteSubmissionAPI,
} from "../services/submissionService";

//  Student Hook 
interface UseMySubmissionReturn {
  submission:   Submission | null;
  isLoading:    boolean;
  error:        string | null;
  isSubmitting: boolean;
  submitError:  string;
  submit:       (body: CreateSubmissionBody) => Promise<void>;
  refetch:      () => void;
}

export const useMySubmission = (assignmentId: string): UseMySubmissionReturn => {
  const [submission,   setSubmission]   = useState<Submission | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState("");

  const fetchSubmission = useCallback(async () => {
    if (!assignmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMySubmissionAPI(assignmentId);
      setSubmission(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load submission.");
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => { fetchSubmission(); }, [fetchSubmission]);

  const submit = async (body: CreateSubmissionBody): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const data = await submitAssignmentAPI(body);
      setSubmission(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to submit.";
      setSubmitError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submission, isLoading, error,
    isSubmitting, submitError,
    submit, refetch: fetchSubmission,
  };
};

//  Teacher Hook 
interface UseSubmissionsReturn {
  submissions: Submission[];
  isLoading:   boolean;
  error:       string | null;
  grade:       (id: string, body: GradeSubmissionBody) => Promise<void>;
  remove:      (id: string) => Promise<void>;
  refetch:     () => void;
}

export const useSubmissions = (assignmentId: string): UseSubmissionsReturn => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSubmissionsByAssignmentAPI(assignmentId);
      setSubmissions(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load submissions.");
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const grade = async (id: string, body: GradeSubmissionBody): Promise<void> => {
    const updated = await gradeSubmissionAPI(id, body);
    setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const remove = async (id: string): Promise<void> => {
    try { await deleteSubmissionAPI(id); } catch {}
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  return { submissions, isLoading, error, grade, remove, refetch: fetchSubmissions };
};