import { useState, useCallback } from 'react';
import { useUserStore } from '../store/userStore';

// Replaces repeated confirm modal + audit pattern in Admin* and Doctor* pages
// Usage: const { confirm, pending, request, confirmAction, cancel } = useConfirmAction<'approve'|'reject'>()
export function useConfirmAction<T extends string = string>() {
  const { addAuditLog, addAdminAction, adminKeyMember } = useUserStore();
  const [confirm, setConfirm] = useState<{ row: any; action: T } | null>(null);

  const request = useCallback((row: any, action: T) => setConfirm({ row, action }), []);
  const cancel = useCallback(() => setConfirm(null), []);

  const confirmWithAudit = useCallback(
    (opts: { actionLabel: string; auditAction: string; adminAction: string; onConfirm: (row: any, action: T) => void }) => {
      if (!confirm) return;
      opts.onConfirm(confirm.row, confirm.action);
      addAuditLog({ accessor: adminKeyMember || 'Admin', role: 'Admin', action: opts.auditAction, status: 'Success' });
      addAdminAction({ adminName: adminKeyMember || 'Admin', action: opts.adminAction, details: `${confirm.row.id || confirm.row.name} -> ${confirm.action}` });
      setConfirm(null);
    },
    [confirm, addAuditLog, addAdminAction, adminKeyMember]
  );

  return { confirm, request, cancel, confirmWithAudit, setConfirm };
}
