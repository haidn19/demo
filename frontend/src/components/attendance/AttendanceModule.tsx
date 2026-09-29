"use client";

import { useEffect, useState, type FormEvent } from "react";
import { checkIn, checkOut, getDailyAttendance, getMonthlyBalance } from "@/services/attendanceService";
import { getEmployees } from "@/services/employeeService";
import type { Employee } from "@/types/employee";
import type { Attendance } from "@/types/modules";
import { formatMinutes, toDateInputValue } from "@/utils/format";
import EmployeeSelect from "@/components/ui/EmployeeSelect";
import PageState from "@/components/ui/PageState";
import AttendanceSummary from "./AttendanceSummary";

type BusyAction = "check-in" | "check-out" | "daily" | "balance" | null;

function lastDateOfMonth(month: string): string {
  if (!month) return "";
  const [year, monthNumber] = month.split("-").map(Number);
  return toDateInputValue(new Date(year, monthNumber, 0));
}

export default function AttendanceModule() {
  const today = toDateInputValue();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [toDate, setToDate] = useState(today);
  const [record, setRecord] = useState<Attendance | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => setError("Không thể tải danh sách nhân viên."));
  }, []);

  async function runAction(action: "in" | "out") {
    if (employeeId === "") return;
    try {
      setBusyAction(action === "in" ? "check-in" : "check-out");
      setError("");
      const data = action === "in" ? await checkIn(employeeId) : await checkOut(employeeId);
      setRecord(data);
      setDate(data.workDate);
    } catch {
      setError(action === "in" ? "Chấm công vào thất bại hoặc nhân viên đã chấm vào." : "Chấm công ra thất bại. Hãy kiểm tra trạng thái chấm công.");
    } finally {
      setBusyAction(null);
    }
  }

  async function findDaily(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (employeeId === "") return;
    try {
      setBusyAction("daily");
      setError("");
      setRecord(await getDailyAttendance(employeeId, date));
    } catch {
      setRecord(null);
      setError("Không tìm thấy dữ liệu chấm công của ngày đã chọn.");
    } finally {
      setBusyAction(null);
    }
  }

  async function findBalance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (employeeId === "") return;
    try {
      setBusyAction("balance");
      setError("");
      setBalance(await getMonthlyBalance(employeeId, month, toDate));
    } catch {
      setBalance(null);
      setError("Không thể tính công tháng. Ngày chốt phải thuộc tháng đã chọn.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="moduleStack">
      <section className="card actionCard">
        <div className="formHeading">
          <p className="eyebrow">Ghi nhận thời gian</p>
          <h2>Chấm công hôm nay</h2>
          <p className="muted">Chọn nhân viên trước khi ghi nhận giờ vào hoặc giờ ra.</p>
        </div>
        <div className="field">
          <label htmlFor="attendanceEmployee">Nhân viên</label>
          <EmployeeSelect id="attendanceEmployee" employees={employees} value={employeeId} onChange={setEmployeeId} />
        </div>
        <div className="buttonGroup">
          <button className="button primary" type="button" title="Ghi nhận giờ bắt đầu làm việc" disabled={busyAction !== null || employeeId === ""} onClick={() => void runAction("in")}>{busyAction === "check-in" ? "Đang chấm công..." : "Chấm công vào"}</button>
          <button className="button" type="button" title="Ghi nhận giờ kết thúc làm việc" disabled={busyAction !== null || employeeId === ""} onClick={() => void runAction("out")}>{busyAction === "check-out" ? "Đang chấm công..." : "Chấm công ra"}</button>
        </div>
      </section>

      <div className="twoColumn">
        <form className="card queryCard" onSubmit={findDaily}>
          <div className="formHeading"><p className="eyebrow">Tra cứu</p><h2>Công theo ngày</h2></div>
          <div className="field"><label htmlFor="dailyDate">Ngày làm việc</label><input id="dailyDate" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></div>
          <button className="button primary" type="submit" title="Tra cứu chấm công theo ngày đã chọn" disabled={busyAction !== null || employeeId === ""}>{busyAction === "daily" ? "Đang tải..." : "Xem dữ liệu"}</button>
        </form>

        <form className="card queryCard" onSubmit={findBalance}>
          <div className="formHeading"><p className="eyebrow">Tổng hợp</p><h2>Cân đối công tháng</h2></div>
          <div className="field"><label htmlFor="balanceMonth">Tháng</label><input id="balanceMonth" type="month" value={month} onChange={(event) => { const value = event.target.value; setMonth(value); setToDate(lastDateOfMonth(value)); }} required /></div>
          <div className="field"><label htmlFor="balanceDate">Chốt đến ngày</label><input id="balanceDate" type="date" min={`${month}-01`} max={lastDateOfMonth(month)} value={toDate} onChange={(event) => setToDate(event.target.value)} required /></div>
          <button className="button" type="submit" title="Tính cân đối công đến ngày chốt" disabled={busyAction !== null || employeeId === ""}>{busyAction === "balance" ? "Đang tính..." : "Tính công tháng"}</button>
          {balance !== null && <div className="balanceResult"><span>Cân đối hiện tại</span><strong>{balance > 0 ? `Thiếu ${formatMinutes(balance)}` : formatMinutes(balance)}</strong></div>}
        </form>
      </div>

      {error && <PageState type="error" title="Không thể thực hiện" description={error} />}
      {record && <AttendanceSummary record={record} />}
    </div>
  );
}
