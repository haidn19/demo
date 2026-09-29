export interface Attendance {
  id: number;
  employeeId: number;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  effectiveOut: string | null;
  morningMinutes: number;
  afternoonMinutes: number;
  latePenaltyMinutes: number;
  extraMinutes: number;
  workingMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  balanceMinutes: number | null;
  morningWorkLost: boolean;
  afternoonWorkLost: boolean;
  status: string;
}

export interface LeaveRequest {
  employeeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface Leave extends LeaveRequest {
  id: number;
  employeeName: string;
  leaveDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface Payroll {
  employeeId: number;
  fromDate: string;
  toDate: string;
  baseSalary: number;
  paidDays: number;
  salary: number;
  overtimePay: number;
  totalSalary: number | null;
  leaveDaysUsed: number;
  monthlyBalanceMinutes: number;
  deductionRequired: boolean;
}

export interface UserAccount {
  id: number;
  username: string;
  role: string;
  status: boolean;
}
