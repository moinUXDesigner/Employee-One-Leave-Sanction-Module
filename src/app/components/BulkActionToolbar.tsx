import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { X, CheckCircle, XCircle, Send, ArrowLeft } from 'lucide-react';

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
    disabled?: boolean;
  }>;
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  actions,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <Card className="shadow-2xl border-2 border-primary">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-base px-3 py-1">
              {selectedCount} Selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className="h-8"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
