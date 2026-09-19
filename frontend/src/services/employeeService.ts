import api from "./api";
import type { Department, Employee, EmployeeRequest } from "@/types/employee";

export async function getEmployees(): Promise<Employee[]> {
  const response = await api.get<Employee[]>("/employees");
  return response.data;
}

export async function getDepartments(): Promise<Department[]> {
  const response = await api.get<Department[]>("/departments");
  return response.data;
}

export async function getEmployee(id: number): Promise<Employee> {
  const response = await api.get<Employee>(`/employees/${id}`);
  return response.data;
}

export async function createEmployee(data: EmployeeRequest): Promise<Employee> {
  const response = await api.post<Employee>("/employees", data);
  return response.data;
}

export async function updateEmployee(
  id: number,
  data: EmployeeRequest,
): Promise<Employee> {
  const response = await api.put<Employee>(`/employees/${id}`, data);
  return response.data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/employees/${id}`);
}
