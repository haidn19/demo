export interface Employee {
  id: number;
  name: string;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  address: string | null;
  email: string | null;
  taxCode: string | null;
  department: Department | null;
  baseSalary: number | null;
  remainingLeaveDays: number | null;
}

export interface Department {
  id: number;
  name: string;
  employeeCount?: number;
  leader?: DepartmentLeader | null;
}

export interface DepartmentLeader {
  id: number;
  name: string;
}

export interface DepartmentRequest {
  name: string;
  leaderId: number | null;
}

export interface EmployeeRequest {
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  email: string;
  taxCode: string;
  departmentId: number | null;
  baseSalary: number;
  LeaveDays: number;
}
