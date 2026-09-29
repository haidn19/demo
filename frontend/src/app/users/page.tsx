import AppShell from "@/components/AppShell";
import UserModule from "@/components/users/UserModule";

export default function UsersPage() {
  return (
    <AppShell
      title="Tài khoản"
      description="Kiểm soát vai trò và trạng thái truy cập của người dùng."
    >
      <UserModule />
    </AppShell>
  );
}
