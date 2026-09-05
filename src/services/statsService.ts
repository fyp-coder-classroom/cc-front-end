import API from "./api";
import type { ClassroomStats, MyStats } from "../types/stats";

export const getClassroomStatsAPI = async (classroomId: string): Promise<ClassroomStats> => {
  const { data } = await API.get(`/statistic/classroom/${classroomId}`);
  return data.data;
};

export const getMyStatsAPI = async (classroomId: string): Promise<MyStats> => {
  const { data } = await API.get(`/statistic/my/${classroomId}`);
  return data.data;
};

export const recomputeClassroomStatsAPI = async (classroomId: string): Promise<ClassroomStats> => {
  const { data } = await API.post(`/statistic/classroom/${classroomId}/recompute`);
  return data.data;
};