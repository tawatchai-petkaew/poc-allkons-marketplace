'use client';

import BadgeLabel from '@/components/BadgeLabel';

interface MemberStatusBadgeProps {
  status: string;
}

const MemberStatusBadge = ({ status }: MemberStatusBadgeProps) => {
  switch (status.toUpperCase()) {
    case 'ACCEPTED':
      return (
        <BadgeLabel
          text="เข้าร่วมแล้ว"
          color="success"
          rounding="pill"
          size="small"
          variant="ghost"
          prefix={<i className="ri-user-follow-line text-icon-brand-dark text-xs" />}
        />
      );
    case 'APPROVED':
      return (
        <BadgeLabel
          text="อนุมัติแล้ว"
          color="success"
          rounding="pill"
          size="small"
          variant="ghost"
          prefix={<i className="ri-user-follow-line text-icon-brand-dark text-xs" />}
        />
      );
    case 'WAIT_FOR_APPROVE':
    case 'PENDING':
      return (
        <BadgeLabel
          text="รออนุมัติ"
          color="warning"
          rounding="pill"
          size="small"
          variant="ghost"
          prefix={<i className="ri-user-search-line text-warning-p20 text-xs" />}
        />
      );
    case 'SENT':
      return (
        <BadgeLabel
          text="ส่งคำเชิญ"
          color="warning"
          rounding="pill"
          size="small"
          variant="ghost"
          prefix={<i className="ri-user-search-line text-warning-p20 text-xs" />}
        />
      );
    case 'REJECTED':
      return (
        <BadgeLabel
          text="ปฏิเสธ"
          color="neutral"
          rounding="pill"
          size="small"
          variant="ghost"
          prefix={<i className="ri-close-line text-text-secondary text-xs" />}
        />
      );
    case 'EXPIRED':
      return (
        <BadgeLabel
          text="หมดอายุ"
          color="error"
          rounding="pill"
          size="small"
          variant="ghost"
          prefix={<i className="ri-history-line text-error text-xs" />}
        />
      );
    default:
      return (
        <BadgeLabel
          text={status}
          color="neutral"
          rounding="pill"
          size="small"
          variant="ghost"
        />
      );
  }
};

export default MemberStatusBadge;
