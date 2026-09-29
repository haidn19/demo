import api from "./api";
import type { Leave, LeaveRequest } from "@/types/modules";

export async function getLeaves(): Promise<Leave[]> {
  const response = await api.get<Leave[]>("/leaves");
  return response.data;
}

export async function createLeave(data: LeaveRequest): Promise<Leave> {
  const response = await api.post<Leave>("/leaves", data);
  return response.data;
}

export async function approveLeave(id: number): Promise<Leave> {
  const response = await api.patch<Leave>(`/leaves/${id}/approve`);
  return response.data;
}

export async function rejectLeave(id: number): Promise<Leave> {
  const response = await api.patch<Leave>(`/leaves/${id}/reject`);
  return response.data;
}
