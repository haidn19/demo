import api from "./api";
import type { Payroll } from "@/types/modules";

export async function getPayroll(
  employeeId: number,
  toDate: string,
): Promise<Payroll> {
  const response = await api.get<Payroll>(`/payroll/${employeeId}`, {
    params: { toDate },
  });
  return response.data;
}
