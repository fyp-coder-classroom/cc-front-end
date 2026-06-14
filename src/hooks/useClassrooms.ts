import { useState, useEffect, useCallback } from "react";
import type { Classroom, CreateClassroomBody, JoinClassroomBody } from "../types/classroom";
import {
  getTeacherClassroomsAPI,
  getStudentClassroomsAPI,
  createClassroomAPI,
  joinClassroomAPI,
  deleteClassroomAPI,
} from "../services/classroomService";
import type { Role } from "../types/auth";

interface UseClassroomsReturn {
  classrooms:      Classroom[];
  isLoading:       boolean;
  error:           string | null;
  createClassroom: (body: CreateClassroomBody) => Promise<void>;
  joinClassroom:   (body: JoinClassroomBody)   => Promise<void>;
  deleteClassroom: (id: string)                => Promise<void>;
  refetch:         ()                          => void;
}

export const useClassrooms = (role: Role): UseClassroomsReturn => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading,  setIsLoading]  = useState<boolean>(true);
  const [error,      setError]      = useState<string | null>(null);

  const fetchClassrooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data =
        role === "teacher"
          ? await getTeacherClassroomsAPI()
          : await getStudentClassroomsAPI();
      setClassrooms(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to load classrooms.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const createClassroom = async (body: CreateClassroomBody): Promise<void> => {
    const newClass = await createClassroomAPI(body);
    setClassrooms((prev) => [newClass, ...prev]);
  };

  const joinClassroom = async (body: JoinClassroomBody): Promise<void> => {
    const joined = await joinClassroomAPI(body);
    setClassrooms((prev) => [joined, ...prev]);
  };

  // ── FIX: Delete ke baad immediately UI se hatao + refetch ──
  // const deleteClassroom = async (id: string): Promise<void> => {
  //   await deleteClassroomAPI(id);
  //   // Immediately remove from UI — no wait
  //   setClassrooms((prev) => prev.filter((c) => c._id !== id));
  // };
const deleteClassroom = async (id: string): Promise<void> => {
  try {
    await deleteClassroomAPI(id);
  } catch {
    // ignore 204
  }
  setClassrooms((prev) => prev.filter((c) => (c.id || c._id) !== id));
};
  return {
    classrooms,
    isLoading,
    error,
    createClassroom,
    joinClassroom,
    deleteClassroom,
    refetch: fetchClassrooms,
  };
};