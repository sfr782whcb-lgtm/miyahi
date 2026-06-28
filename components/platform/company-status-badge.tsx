import type { CompanyStatus } from "@prisma/client";
import { COMPANY_STATUS_COLORS, COMPANY_STATUS_LABELS } from "@/lib/constants/platform";

export default function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${COMPANY_STATUS_COLORS[status]}`}
    >
      {COMPANY_STATUS_LABELS[status]}
    </span>
  );
}
