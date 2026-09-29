"use client";

import { useState, type FormEvent } from "react";
import type { Employee } from "@/types/employee";
import type { Leave, LeaveRequest } from "@/types/modules";
import { createLeave } from "@/services/leaveService";
import { toDateInputValue } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";
import EmployeeSelect from "@/components/ui/EmployeeSelect";

function addWorkingDays(date: Date, days: number): string {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let added = 0;

  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added += 1;
  }

  return toDateInputValue(result);
}

export default function LeaveRequestForm({
  employees,
  onSuccess,
  onError,
}: {
  employees: Employee[];
  onSuccess: (leave: Leave) => void;
  onError: (message: string) => void;
}) {
  const minimumStartDate = addWorkingDays(new Date(), 3);
  const [form, setForm] = useState<LeaveRequest>({
    employeeId: 0,
    startDate: minimumStartDate,
    endDate: minimumStartDate,
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.employeeId) return;
    if (form.startDate > form.endDate) {
      onError("Ngày kết thúc không được trước ngày bắt đầu.");
      return;
    }
    try {
      setSaving(true);
      onError("");
      const leave = await createLeave({ ...form, reason: form.reason.trim() });
      onSuccess(leave);
      setForm((current) => ({
        ...current,
        startDate: minimumStartDate,
        endDate: minimumStartDate,
        reason: "",
      }));
    } catch (error) {
      onError(getApiErrorMessage(error, "Không thể tạo đơn nghỉ. Vui lòng thử lại."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form leaveForm" onSubmit={submit}>
      <div className="formHeading fullField">
        <p className="eyebrow">Đăng ký nghỉ</p>
        <h2>Tạo đơn nghỉ phép</h2>
        <p className="muted">Chọn ngày nghỉ từ {minimumStartDate.split("-").reverse().join("/")}. Lý do cần ít nhất 10 ký tự.</p>
      </div>
      <div className="field fullField">
        <label htmlFor="leaveEmployee">Nhân viên *</label>
        <EmployeeSelect
          id="leaveEmployee"
          employees={employees}
          value={form.employeeId || ""}
          onChange={(value) => setForm({ ...form, employeeId: value === "" ? 0 : value })}
          getOptionLabel={(employee) => `${employee.name} — còn ${employee.remainingLeaveDays ?? 0} ngày phép`}
        />
      </div>
      <div className="field"><label htmlFor="startDate">Từ ngày *</label><input id="startDate" type="date" min={minimumStartDate} value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value, endDate: event.target.value > form.endDate ? event.target.value : form.endDate })} required /></div>
      <div className="field"><label htmlFor="endDate">Đến ngày *</label><input id="endDate" type="date" min={form.startDate} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required /></div>
      <div className="field fullField"><label htmlFor="leaveReason">Lý do *</label><textarea id="leaveReason" rows={4} minLength={10} maxLength={500} required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Nhập lý do nghỉ phép (ít nhất 10 ký tự)" /></div>
      <div className="formActions fullField"><button className="button primary" type="submit" title="Gửi đơn nghỉ phép để chờ duyệt" disabled={saving || !form.employeeId}>{saving ? "Đang gửi..." : "Gửi đơn nghỉ"}</button></div>
    </form>
  );
}
