"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getEmployees } from "@/services/employeeService";
import { getPayroll } from "@/services/payrollService";
import type { Employee } from "@/types/employee";
import type { Payroll } from "@/types/modules";
import { toDateInputValue } from "@/utils/format";
import EmployeeSelect from "@/components/ui/EmployeeSelect";
import PageState from "@/components/ui/PageState";
import PayrollResult from "./PayrollResult";

export default function PayrollModule() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [toDate, setToDate] = useState(toDateInputValue());
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => setError("Không thể tải danh sách nhân viên."));
  }, []);

  async function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (employeeId === "") return;
    try {
      setLoading(true);
      setError("");
      setPayroll(await getPayroll(employeeId, toDate));
    } catch {
      setPayroll(null);
      setError("Không thể tính bảng lương. Hãy kiểm tra dữ liệu chấm công và ngày chốt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="moduleStack">
      <form className="card payrollForm" onSubmit={calculate}>
        <div className="formHeading"><p className="eyebrow">Kỳ thanh toán</p><h2>Tính lương nhân viên</h2><p className="muted">Kết quả được tính từ đầu tháng đến ngày chốt.</p></div>
        <div className="field"><label htmlFor="payrollEmployee">Nhân viên</label><EmployeeSelect id="payrollEmployee" employees={employees} value={employeeId} onChange={setEmployeeId} /></div>
        <div className="field"><label htmlFor="payrollDate">Ngày chốt</label><input id="payrollDate" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} required /></div>
        <div className="formActions"><button className="button primary" type="submit" title="Tính bảng lương đến ngày chốt" disabled={loading || employeeId === ""}>{loading ? "Đang tính..." : "Tính bảng lương"}</button></div>
      </form>
      {error && <PageState type="error" title="Không thể tính lương" description={error} />}
      {payroll ? <PayrollResult payroll={payroll} /> : !error && <PageState title="Chưa có kết quả" description="Chọn nhân viên và ngày chốt để xem chi tiết bảng lương." />}
    </div>
  );
}
