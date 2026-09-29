"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "@/services/departmentService";
import { getEmployees } from "@/services/employeeService";
import type { Department, DepartmentRequest, Employee } from "@/types/employee";
import PageState from "@/components/ui/PageState";

const emptyForm: DepartmentRequest = { name: "", leaderId: null };

export default function DepartmentManager() {
  const { data: session } = useSession();
  const isAdmin = session?.roles.includes("ADMIN") ?? false;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<DepartmentRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      const [departmentData, employeeData] = await Promise.all([
        getDepartments(),
        getEmployees(),
      ]);
      setDepartments(departmentData);
      setEmployees(employeeData);
    } catch {
      setError("Không thể tải dữ liệu phòng ban. Vui lòng kiểm tra kết nối API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editDepartment(department: Department) {
    setEditingId(department.id);
    setForm({ name: department.name, leaderId: department.leader?.id ?? null });
  }

  async function submitDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      setError("");
      const request = { ...form, name: form.name.trim() };
      if (editingId === null) await createDepartment(request);
      else await updateDepartment(editingId, request);
      resetForm();
      await loadData();
    } catch {
      setError("Không thể lưu phòng ban. Tên có thể đã tồn tại hoặc trưởng phòng không hợp lệ.");
    } finally {
      setSaving(false);
    }
  }

  async function removeDepartment(department: Department) {
    if (!window.confirm(`Xóa phòng ban ${department.name}?`)) return;
    try {
      setDeletingId(department.id);
      await deleteDepartment(department.id);
      await loadData();
    } catch {
      setError("Không thể xóa phòng ban đang có nhân viên.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="moduleStack">
      {isAdmin && (
        <form className="card inlineForm" onSubmit={submitDepartment}>
          <div className="formHeading">
            <p className="eyebrow">{editingId === null ? "Thêm mới" : "Cập nhật"}</p>
            <h2>{editingId === null ? "Tạo phòng ban" : "Sửa phòng ban"}</h2>
          </div>
          <div className="field">
            <label htmlFor="departmentName">Tên phòng ban</label>
            <input
              id="departmentName"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Ví dụ: Kinh doanh"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="departmentLeader">Trưởng phòng</label>
            <select
              id="departmentLeader"
              value={form.leaderId ?? ""}
              onChange={(event) => setForm({
                ...form,
                leaderId: event.target.value ? Number(event.target.value) : null,
              })}
            >
              <option value="">Chưa phân công</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>
          </div>
          <div className="formActions">
            <button className="button primary" type="submit" title={editingId === null ? "Tạo phòng ban mới" : "Lưu thay đổi phòng ban"} disabled={saving}>
              {saving ? "Đang lưu..." : editingId === null ? "Tạo phòng ban" : "Lưu thay đổi"}
            </button>
            {editingId !== null && (
              <button className="button" type="button" title="Hủy chỉnh sửa phòng ban" onClick={resetForm}>Hủy</button>
            )}
          </div>
        </form>
      )}

      {error && <PageState type="error" title="Có lỗi xảy ra" description={error} />}
      {loading && <PageState type="loading" title="Đang tải phòng ban" />}
      {!loading && !error && departments.length === 0 && (
        <PageState title="Chưa có phòng ban" description="Tạo phòng ban đầu tiên để bắt đầu phân công nhân viên." />
      )}
      {!loading && departments.length > 0 && (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Phòng ban</th>
                <th>Nhân sự</th>
                <th>Trưởng phòng</th>
                {isAdmin && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id}>
                  <td><strong>{department.name}</strong><span className="tableMeta">Mã PB-{department.id}</span></td>
                  <td><span className="countBadge">{department.employeeCount ?? 0}</span></td>
                  <td>{department.leader?.name ?? <span className="muted">Chưa phân công</span>}</td>
                  {isAdmin && (
                    <td><div className="actions">
                      <button className="button small" type="button" aria-label={`Chỉnh sửa phòng ban ${department.name}`} title={`Chỉnh sửa ${department.name}`} onClick={() => editDepartment(department)}>Sửa</button>
                      <button className="button small dangerText" type="button" aria-label={`Xóa phòng ban ${department.name}`} title={`Xóa ${department.name}`} disabled={deletingId === department.id} onClick={() => void removeDepartment(department)}>{deletingId === department.id ? "Đang xóa..." : "Xóa"}</button>
                    </div></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
