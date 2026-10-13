import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  let bg = 'bg-[#FAF8F2]';
  let text = 'text-[#73796F]';
  let border = 'border-[#E8E5DC]';
  let label = status.replace('_', ' ');

  switch (status.toUpperCase()) {
    case 'APPROVED':
    case 'PUBLISHED':
    case 'CHECKED_IN':
      bg = 'bg-[#174C3C]/10';
      text = 'text-[#174C3C]';
      border = 'border-[#174C3C]/30';
      break;
    case 'PENDING_APPROVAL':
      bg = 'bg-[#F4C95D]/20';
      text = 'text-[#A07010]';
      border = 'border-[#F4C95D]/60';
      label = 'Pending Review';
      break;
    case 'REGISTERED':
      bg = 'bg-[#27866A]/15';
      text = 'text-[#27866A]';
      border = 'border-[#27866A]/40';
      label = 'Registered';
      break;
    case 'DRAFT':
      bg = 'bg-[#FAF8F2]';
      text = 'text-[#73796F]';
      border = 'border-[#E8E5DC]';
      label = 'Draft';
      break;
    case 'REJECTED':
      bg = 'bg-[#FF6B4A]/15';
      text = 'text-[#FF6B4A]';
      border = 'border-[#FF6B4A]/40';
      label = 'Needs Revision';
      break;
    case 'CANCELLED':
      bg = 'bg-[#E8E5DC]';
      text = 'text-[#73796F]';
      border = 'border-[#E8E5DC]';
      label = 'Cancelled';
      break;
    case 'COMPLETED':
      bg = 'bg-[#174C3C]/10';
      text = 'text-[#174C3C]';
      border = 'border-[#174C3C]/20';
      label = 'Completed';
      break;
  }

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-medium',
    lg: 'px-3.5 py-1.5 text-base font-medium'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${text} ${border} font-semibold uppercase tracking-wider ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};
