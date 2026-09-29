import AppShell from "@/components/AppShell";
import LeaveModule from "@/components/leaves/LeaveModule";

export default function LeavesPage() {
  return (
    <AppShell
      title="Nghỉ phép"
      description="Tạo yêu cầu nghỉ và xử lý trạng thái đơn nghỉ phép."
    >
      <LeaveModule />
    </AppShell>
  );
}
