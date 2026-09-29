import AppShell from "@/components/AppShell";
import PayrollModule from "@/components/payroll/PayrollModule";

export default function PayrollPage() {
  return (
    <AppShell
      title="Bảng lương"
      description="Tính và xem chi tiết lương theo ngày công của từng nhân viên."
    >
      <PayrollModule />
    </AppShell>
  );
}
