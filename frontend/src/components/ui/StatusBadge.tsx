const labels: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  WORKING: "Đang làm việc",
  COMPLETED: "Hoàn thành",
  ABSENT: "Vắng mặt",
  LEAVE: "Nghỉ phép",
};

export default function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  return (
    <span className={`statusBadge status-${normalized.toLowerCase()}`}>
      {labels[normalized] ?? status}
    </span>
  );
}
