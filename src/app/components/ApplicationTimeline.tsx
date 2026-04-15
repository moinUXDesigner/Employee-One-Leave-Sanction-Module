import { formatDate } from '../utils/leaveCalculations';
import { Badge } from './ui/badge';
import type { WorkflowHistoryItem } from '../types';
import {
  CheckCircle,
  Send,
  Eye,
  XCircle,
  Clock,
  AlertCircle,
  FileCheck,
  UserCheck,
} from 'lucide-react';

interface ApplicationTimelineProps {
  workflowHistory: WorkflowHistoryItem[];
  currentStatus?: string;
}

export function ApplicationTimeline({ workflowHistory, currentStatus }: ApplicationTimelineProps) {
  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('submit')) return CheckCircle;
    if (actionLower.includes('forward')) return Send;
    if (actionLower.includes('review') || actionLower.includes('verify')) return Eye;
    if (actionLower.includes('reject')) return XCircle;
    if (actionLower.includes('sanction') && !actionLower.includes('pending')) return FileCheck;
    if (actionLower.includes('approved')) return UserCheck;
    if (actionLower.includes('hold')) return Clock;
    return AlertCircle;
  };

  const getActionColor = (action: string, toStatus: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('reject')) return 'text-red-600 bg-red-50 border-red-200';
    if (actionLower.includes('sanction') && !actionLower.includes('pending'))
      return 'text-green-600 bg-green-50 border-green-200';
    if (actionLower.includes('approved')) return 'text-green-600 bg-green-50 border-green-200';
    if (actionLower.includes('hold')) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (actionLower.includes('return')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Employee':
        return 'bg-gray-600';
      case 'ControllingOfficer':
        return 'bg-blue-600';
      case 'HR':
        return 'bg-purple-600';
      case 'SanctionAuthority':
        return 'bg-green-600';
      case 'Accounts':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(timestamp);
    }
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

      {/* Timeline items */}
      <div className="space-y-6">
        {workflowHistory.map((item, index) => {
          const Icon = getActionIcon(item.action);
          const colorClass = getActionColor(item.action, item.toStatus);
          const isLatest = index === workflowHistory.length - 1;

          return (
            <div key={index} className="relative flex gap-4 pb-2">
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${colorClass} ${
                    isLatest ? 'ring-4 ring-primary/20' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base mb-1">{item.action}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{item.actionByName}</span>
                        <span>•</span>
                        <Badge className={`${getRoleBadgeColor(item.role)} text-xs`}>
                          {item.role === 'ControllingOfficer' ? 'CO' : item.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-medium">{formatDate(item.actionDate)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(item.actionDate)}
                      </div>
                    </div>
                  </div>

                  {/* Status transition */}
                  {item.fromStatus && item.toStatus && (
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <Badge variant="outline" className="font-mono">
                        {item.fromStatus}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline" className="font-mono">
                        {item.toStatus}
                      </Badge>
                    </div>
                  )}

                  {/* Remarks */}
                  {item.remarks && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground italic">"{item.remarks}"</p>
                    </div>
                  )}

                  {/* Latest indicator */}
                  {isLatest && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-primary font-medium">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Current Status
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending next action */}
      {currentStatus && currentStatus !== 'Closed' && currentStatus !== 'Sanctioned' && (
        <div className="relative flex gap-4 mt-6">
          <div className="relative z-10 flex-shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 pt-0.5">
            <div className="bg-muted/50 border border-dashed rounded-lg p-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Pending Action</h4>
              <p className="text-sm text-muted-foreground">
                Awaiting {currentStatus.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
