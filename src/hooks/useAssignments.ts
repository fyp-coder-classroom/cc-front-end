// hooks/useAssignments.ts
// Usage: const { assignments, isLoading, error, createAssignment, deleteAssignment } = useAssignments(classroomId);

import { useState, useEffect, useCallback } from "react";
import type {
  Assignment,
  CreateAssignmentBody,
  UpdateAssignmentBody,
} from "../types/assignment";
import {
  getAssignmentsByClassroomAPI,
  createAssignmentAPI,
  updateAssignmentAPI,
  deleteAssignmentAPI,
} from "../services/assignmentService";

interface UseAssignmentsReturn {
  assignments:      Assignment[];
  isLoading:        boolean;
  error:            string | null;
  createAssignment: (body: CreateAssignmentBody) => Promise<void>;
  updateAssignment: (assignmentId: string, body: UpdateAssignmentBody) => Promise<void>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
  refetch:          () => void;
}

export const useAssignments = (classroomId: string): UseAssignmentsReturn => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading,   setIsLoading]   = useState<boolean>(true);
  const [error,       setError]       = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!classroomId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAssignmentsByClassroomAPI(classroomId);
      setAssignments(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to load assignments.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const createAssignment = async (body: CreateAssignmentBody): Promise<void> => {
    const created = await createAssignmentAPI(classroomId, body);
    setAssignments((prev) => [created, ...prev]);
  };

  const updateAssignment = async (
    assignmentId: string,
    body: UpdateAssignmentBody
  ): Promise<void> => {
    const updated = await updateAssignmentAPI(classroomId, assignmentId, body);
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? updated : a))
    );
  };

  const deleteAssignment = async (assignmentId: string): Promise<void> => {
    await deleteAssignmentAPI(classroomId, assignmentId);
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  };

  return {
    assignments,
    isLoading,
    error,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    refetch: fetchAssignments,
  };
};
