import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldAlert, AlertCircle } from 'lucide-react';

export function StatusBadge({ status, className }) {
  if (!status) return null;
  const s = String(status).toLowerCase();

  switch (s) {
    case 'completed':
    case 'approved':
    case 'verified':
    case 'active':
      return (
        <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />} className={className}>
          {status}
        </Badge>
      );
    case 'pending':
    case 'processing':
    case 'unverified':
      return (
        <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5 animate-pulse" />} className={className}>
          {status}
        </Badge>
      );
    case 'failed':
    case 'rejected':
    case 'blocked':
    case 'suspended':
    case 'cancelled':
      return (
        <Badge variant="danger" icon={<XCircle className="w-3.5 h-3.5" />} className={className}>
          {status}
        </Badge>
      );
    case 'flagged':
      return (
        <Badge variant="purple" icon={<ShieldAlert className="w-3.5 h-3.5" />} className={className}>
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="default" icon={<AlertCircle className="w-3.5 h-3.5" />} className={className}>
          {status}
        </Badge>
      );
  }
}
