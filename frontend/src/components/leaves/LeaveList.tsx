"use client";

import { useState } from "react";
import { approveLeave, rejectLeave } from "@/services/leaveService";
import type { Leave } from "@/types/modules";
import { formatDate } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";
import StatusBadge from "@/components/ui/StatusBadge";

type ReviewAction = "approve" | "reject";

export default function LeaveList({
  leaves,
  canReview,
  onChange,
  onError,
}: {
  leaves: Leave[];
  canReview: boolean;
  onChange: (leave: Leave) => void;
  onError: (message: string) => void;
}) {
  const [processing, setProcessing] = useState<{
    id: number;
    action: ReviewAction;
  } | null>(null);

  async function review(leave: Leave, action: ReviewAction) {
    if (
      action === "reject" &&
      !window.confirm(`Từ chối đơn NP-${leave.id} của ${leave.employeeName}?`)
    ) {
      return;
    }

    try {
      setProcessing({ id: leave.id, action });
      onError("");
      const updated = action === "approve"
        ? await approveLeave(leave.id)
        : await rejectLeave(leave.id);
      onChange(updated);
    } catch (error) {
      onError(getApiErrorMessage(error, "Không thể xử lý đơn. Vui lòng thử lại."));
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Nhân viên</th>
            <th>Thời gian nghỉ</th>
            <th>Số ngày</th>
            <th>Lý do</th>
            <th>Trạng thái</th>
            {canReview && <th>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => {
            const isProcessing = processing?.id === leave.id;

            return (
              <tr key={leave.id}>
                <td><strong>NP-{leave.id}</strong></td>
                <td>{leave.employeeName}</td>
                <td>
                  {formatDate(leave.startDate)}
                  <span className="tableMeta">đến {formatDate(leave.endDate)}</span>
                </td>
                <td>{leave.leaveDays} ngày</td>
                <td className="leaveReasonCell">{leave.reason || "—"}</td>
                <td><StatusBadge status={leave.status} /></td>
                {canReview && (
                  <td>
                    {leave.status === "PENDING" ? (
                      <div className="actions">
                        <button
                          className="button small primary"
                          type="button"
                          aria-label={`Duyệt đơn NP-${leave.id} của ${leave.employeeName}`}
                          title={`Duyệt đơn NP-${leave.id}`}
                          disabled={isProcessing}
                          onClick={() => void review(leave, "approve")}
                        >
                          {isProcessing && processing.action === "approve"
                            ? "Đang duyệt..."
                            : "Duyệt"}
                        </button>
                        <button
                          className="button small dangerText"
                          type="button"
                          aria-label={`Từ chối đơn NP-${leave.id} của ${leave.employeeName}`}
                          title={`Từ chối đơn NP-${leave.id}`}
                          disabled={isProcessing}
                          onClick={() => void review(leave, "reject")}
                        >
                          {isProcessing && processing.action === "reject"
                            ? "Đang từ chối..."
                            : "Từ chối"}
                        </button>
                      </div>
                    ) : (
                      <span className="muted">Đã xử lý</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
