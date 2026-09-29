import api from "./api";
import type { Attendance } from "@/types/modules";

export async function checkIn(employeeId: number): Promise<Attendance> {
  const response = await api.post<Attendance>(`/attendance/check-in/${employeeId}`);
  return response.data;
}

export async function checkOut(employeeId: number): Promise<Attendance> {
  const response = await api.post<Attendance>(`/attendance/check-out/${employeeId}`);
  return response.data;
}

export async function getDailyAttendance(
  employeeId: number,
  date: string,
): Promise<Attendance> {
  const response = await api.get<Attendance>(`/attendance/${employeeId}/daily`, {
    params: { date },
  });
  return response.data;
}

export async function getMonthlyBalance(
  employeeId: number,
  month: string,
  toDate: string,
): Promise<number> {
  const response = await api.get<number>(
    `/attendance/${employeeId}/monthly-balance`,
    { params: { month, toDate } },
  );
  return response.data;
}
