import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { useAuth } from '../../../context/AuthContext';
import { leaveService } from '../../../services/leave.service';
import { CheckCircle2, XCircle, AlertTriangle, Info, FileText } from 'lucide-react';
import { formatDaysDisplay } from '../../../utils/leaveCalculations';

interface Step5Props {
  leaveTypeId: string;
  totalDays: number;
  onNext: () => void;
  onBack: () => void;
  leaveType: any;
}

export function Step5Eligibility({
  leaveTypeId,
  totalDays,
  onNext,
  onBack,
  leaveType,
}: Step5Props) {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isEligible, setIsEligible] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [balance, setBalance] = useState<any>(null);
  const [regulations, setRegulations] = useState<string[]>([]);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    if (!user) return;

    setIsChecking(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check eligibility
      const result = await leaveService.checkEligibility(user.userId, leaveTypeId, totalDays);

      // Get balance
      const balanceData = await leaveService.getLeaveBalance(user.userId, leaveTypeId);

      setIsEligible(result.isEligible);
      setReason(result.reason || '');
      setBalance(balanceData);
      setRegulations(leaveType?.applicableRegulations || []);
    } catch (error) {
      console.error('Eligibility check failed:', error);
      setIsEligible(false);
      setReason('Failed to check eligibility');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin text-6xl">⏳</div>
          <div>
            <h3 className="text-xl font-bold mb-2">Checking Eligibility...</h3>
            <p className="text-muted-foreground">
              Verifying leave balance and regulations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Eligibility Check</h2>
        <p className="text-muted-foreground">
          Review your eligibility and applicable regulations
        </p>
      </div>

      {/* Eligibility Result */}
      <Card className={isEligible ? 'border-green-500' : 'border-red-500'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {isEligible ? (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">
                {isEligible ? 'Eligible for Leave' : 'Not Eligible'}
              </h3>
              <p className="text-muted-foreground">
                {isEligible
                  ? 'Your application meets all requirements'
                  : reason || 'Please review the requirements'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Balance Details */}
      {balance && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
            <CardDescription>Your current balance for {leaveType?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Opening Balance</div>
                <div className="text-2xl font-bold">{balance.openingBalance}</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Credits</div>
                <div className="text-2xl font-bold">{balance.credits}</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Availed</div>
                <div className="text-2xl font-bold">{balance.availed}</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
                <div className="text-2xl font-bold text-primary">{balance.balance}</div>
              </div>
            </div>

            <div className="mt-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Applied Days</span>
                <span className="text-xl font-bold text-primary">
                  {formatDaysDisplay(totalDays)}
                </span>
              </div>
              {isEligible && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="font-medium">Balance After Sanction</span>
                  <span className="text-xl font-bold">
                    {balance.balance - totalDays} days
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applicable Regulations */}
      {regulations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applicable Regulations</CardTitle>
            <CardDescription>
              This leave application is governed by the following regulations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regulations.map((reg, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{reg}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      APTRANSCO Leave Regulations
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaveType?.medicalCertificateRequired && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Medical certificate is mandatory for this leave type
              </AlertDescription>
            </Alert>
          )}

          {leaveType?.fitnessCertificateOnReturn && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You must submit a fitness certificate when returning from this leave
              </AlertDescription>
            </Alert>
          )}

          {leaveType?.minDaysNotice > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {leaveType.minDaysNotice} days advance notice is required for this leave type
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Workflow Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Workflow</CardTitle>
          <CardDescription>Your application will follow this route</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <div className="font-medium">Controlling Officer Review</div>
                <div className="text-sm text-muted-foreground">Initial review and forwarding</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <div className="font-medium">HR Verification</div>
                <div className="text-sm text-muted-foreground">
                  Balance check and document verification
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <div className="font-medium">Sanction Authority Approval</div>
                <div className="text-sm text-muted-foreground">Final sanction decision</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <div className="font-medium">SAP Posting</div>
                <div className="text-sm text-muted-foreground">
                  Automatic posting to SAP system
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isEligible}
          size="lg"
        >
          {isEligible ? 'Next: Review & Submit' : 'Cannot Proceed'}
        </Button>
      </div>
    </div>
  );
}
