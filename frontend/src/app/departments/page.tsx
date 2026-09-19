"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import RoleGuard from "@/components/RoleGuard";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "@/services/departmentService";
import { getEmployees } from "@/services/employeeService";
import type { Department, DepartmentRequest, Employee } from "@/types/employee";
import { signOut, useSession } from "next-auth/react";

const emptyForm: DepartmentRequest = { name: "", leaderId: null };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<DepartmentRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const isAdmin = session?.roles.includes("ADMIN") ?? false;

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
      setError(
        "Không thể tải dữ liệu phòng ban. Hãy kiểm tra API và quyền truy cập.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function startEdit(department: Department) {
    setEditingId(department.id);
    setForm({ name: department.name, leaderId: department.leader?.id ?? null });
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Tên phòng ban không được để trống.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const data = { ...form, name: form.name.trim() };
      if (editingId === null) await createDepartment(data);
      else await updateDepartment(editingId, data);
      resetForm();
      await loadData();
    } catch {
      setError(
        "Lưu phòng ban thất bại. Tên có thể đã tồn tại hoặc leader không hợp lệ.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(department: Department) {
    if (!window.confirm(`Xóa phòng ban ${department.name}?`)) return;
    try {
      await deleteDepartment(department.id);
      await loadData();
    } catch {
      setError("Không thể xóa phòng ban đang có nhân viên.");
    }
  }

  return (
    <AuthGuard>
      <main className="container">
        <header className="topbar">
          <div>
            <p className="eyebrow">People operations</p>
            <h1>Phòng ban</h1>
            <p className="muted">Quản lý cơ cấu tổ chức và người phụ trách.</p>
          </div>
          <div className="actions">
            <Link className="button" href="/employees">
              Nhân viên
            </Link>
            <button
              className="button"
              type="button"
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {isAdmin && (
          <RoleGuard role="ADMIN">
            <form className="card departmentForm" onSubmit={handleSubmit}>
              <div>
                <p className="eyebrow">
                  {editingId === null ? "Thêm mới" : "Cập nhật"}
                </p>
                <h2>
                  {editingId === null ? "Tạo phòng ban" : "Sửa phòng ban"}
                </h2>
              </div>
              <label htmlFor="departmentName">Tên phòng ban</label>
              <input
                id="departmentName"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Ví dụ: Kinh doanh"
              />
              <label htmlFor="departmentLeader">Leader</label>
              <select
                id="departmentLeader"
                value={form.leaderId ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    leaderId: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
              >
                <option value="">Chưa phân công</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              <div className="actions">
                <button
                  className="button primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingId === null
                      ? "Tạo phòng ban"
                      : "Lưu thay đổi"}
                </button>
                {editingId !== null && (
                  <button className="button" type="button" onClick={resetForm}>
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </RoleGuard>
        )}

        {error && <div className="card error">{error}</div>}
        {loading && <div className="card">Đang tải...</div>}
        {!loading && departments.length === 0 && (
          <div className="card">Chưa có phòng ban nào.</div>
        )}
        {!loading && departments.length > 0 && (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Tên phòng ban</th>
                  <th>Số nhân viên</th>
                  <th>Leader</th>
                  {isAdmin && <th>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td>
                      <strong>{department.name}</strong>
                      <span className="tableMeta">#{department.id}</span>
                    </td>
                    <td>
                      <span className="countBadge">
                        {department.employeeCount ?? 0}
                      </span>
                    </td>
                    <td>
                      {department.leader?.name ?? (
                        <span className="muted">Chưa phân công</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="actions">
                        <button
                          className="button"
                          type="button"
                          onClick={() => startEdit(department)}
                        >
                          Sửa
                        </button>
                        <button
                          className="button danger"
                          type="button"
                          onClick={() => void handleDelete(department)}
                        >
                          Xóa
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
