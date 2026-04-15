import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { LeaveApplication } from '../types';
import { getUserById, getLeaveTypeById } from '../services/mockData';
import { formatDate } from '../utils/leaveCalculations';

interface BulkActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (remarks?: string) => void;
  applications: LeaveApplication[];
  actionType: 'forward' | 'verify' | 'sanction' | 'reject' | 'return';
  isProcessing?: boolean;
}

export function BulkActionDialog({
  open,
  onClose,
  onConfirm,
  applications,
  actionType,
  isProcessing = false,
}: BulkActionDialogProps) {
  const [remarks, setRemarks] = useState('');

  const getActionConfig = () => {
    switch (actionType) {
      case 'forward':
        return {
          title: 'Bulk Forward Applications',
          description: `Forward ${applications.length} applications to HR for verification`,
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          confirmLabel: 'Forward All',
          variant: 'default' as const,
          requiresRemarks: false,
        };
      case 'verify':
        return {
          title: 'Bulk Verify & Forward',
          description: `Verify ${applications.length} applications and forward to Sanction Authority`,
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          confirmLabel: 'Verify & Forward All',
          variant: 'default' as const,
          requiresRemarks: false,
        };
      case 'sanction':
        return {
          title: 'Bulk Sanction Applications',
          description: `Approve and sanction ${applications.length} applications`,
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          confirmLabel: 'Sanction All',
          variant: 'default' as const,
          requiresRemarks: false,
        };
      case 'reject':
        return {
          title: 'Bulk Reject Applications',
          description: `Reject ${applications.length} applications`,
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          confirmLabel: 'Reject All',
          variant: 'destructive' as const,
          requiresRemarks: true,
        };
      case 'return':
        return {
          title: 'Bulk Return Applications',
          description: `Return ${applications.length} applications for corrections`,
          icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
          confirmLabel: 'Return All',
          variant: 'outline' as const,
          requiresRemarks: true,
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = () => {
    if (config.requiresRemarks && !remarks.trim()) {
      return;
    }
    onConfirm(remarks.trim() || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {config.icon}
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Summary */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Total Applications</div>
              <div className="text-2xl font-bold">{applications.length}</div>
            </div>
          </div>

          {/* Application List */}
          <div className="space-y-2">
            <div className="text-sm font-medium mb-2">Selected Applications:</div>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
              {applications.map((app, index) => {
                const employee = getUserById(app.userId);
                const leaveType = getLeaveTypeById(app.leaveTypeId);
                return (
                  <div
                    key={app.applicationId}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{employee?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {app.applicationId} • {leaveType?.code}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(app.leaveFromDate)} - {formatDate(app.leaveToDate)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Remarks {config.requiresRemarks && <span className="text-red-600">*</span>}
            </label>
            <Textarea
              placeholder={
                config.requiresRemarks
                  ? 'Enter remarks (required)...'
                  : 'Enter optional remarks...'
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Warning */}
          {actionType === 'reject' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. All selected applications
                will be permanently rejected.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant={config.variant}
            onClick={handleConfirm}
            disabled={isProcessing || (config.requiresRemarks && !remarks.trim())}
          >
            {isProcessing ? 'Processing...' : config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
