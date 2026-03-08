interface StatusBadgeProps {
  status: 'emerging' | 'active' | 'ongoing' | 'cooled' | 'archived';
}

const statusMap: Record<string, string> = {
  emerging: 'intel-badge-emerging',
  active: 'intel-badge-active',
  ongoing: 'intel-badge-active',
  cooled: 'intel-badge-cooled',
  archived: 'intel-badge-cooled',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={statusMap[status] || 'intel-badge-cooled'}>
      {status.toUpperCase()}
    </span>
  );
}
