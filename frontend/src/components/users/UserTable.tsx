"use client";

import { useState } from "react";
import type { UserAccount } from "@/types/modules";
import { updateUserStatus } from "@/services/userService";

export default function UserTable({
  users,
  onChange,
  onError,
}: {
  users: UserAccount[];
  onChange: (user: UserAccount) => void;
  onError: (message: string) => void;
}) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function toggle(user: UserAccount) {
    if (user.status && !window.confirm(`Khóa tài khoản ${user.username}?`)) return;

    try {
      setUpdatingId(user.id);
      onError("");
      onChange(await updateUserStatus(user.id, !user.status));
    } catch {
      onError("Không thể đổi trạng thái tài khoản. Bạn không thể tự khóa tài khoản đang đăng nhập.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="tableWrap">
      <table>
        <thead><tr><th>Tài khoản</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td><strong>{user.username}</strong><span className="tableMeta">Mã TK-{user.id}</span></td>
              <td><span className="roleBadge">{user.role.replace(/^ROLE_/, "") === "ADMIN" ? "Quản trị" : "Nhân viên"}</span></td>
              <td><span className={user.status ? "statusBadge status-approved" : "statusBadge status-rejected"}>{user.status ? "Đang hoạt động" : "Đã khóa"}</span></td>
              <td><button className={`button small ${user.status ? "dangerText" : ""}`} type="button" aria-label={`${user.status ? "Khóa" : "Mở khóa"} tài khoản ${user.username}`} title={`${user.status ? "Khóa" : "Mở khóa"} tài khoản ${user.username}`} disabled={updatingId === user.id} onClick={() => void toggle(user)}>{updatingId === user.id ? "Đang lưu..." : user.status ? "Khóa tài khoản" : "Mở khóa"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
