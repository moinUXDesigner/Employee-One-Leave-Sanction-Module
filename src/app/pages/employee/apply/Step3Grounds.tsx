import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Info } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface Step3Props {
  reasonForLeave: string;
  leaveAddress: string;
  contactNumber: string;
  isMedicalLeave: boolean;
  onUpdate: (data: Partial<Step3Data>) => void;
  onNext: () => void;
  onBack: () => void;
  leaveType: any;
}

export interface Step3Data {
  reasonForLeave: string;
  leaveAddress: string;
  contactNumber: string;
  isMedicalLeave: boolean;
}

export function Step3Grounds({
  reasonForLeave,
  leaveAddress,
  contactNumber,
  isMedicalLeave,
  onUpdate,
  onNext,
  onBack,
  leaveType,
}: Step3Props) {
  const { user } = useAuth();

  const canProceed = reasonForLeave.trim().length > 0 &&
    leaveAddress.trim().length > 0 &&
    contactNumber.trim().length > 0;

  const isMedicalLeaveType = leaveType?.category === 'Medical' ||
    leaveType?.medicalCertificateRequired;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Leave Details</h2>
        <p className="text-muted-foreground">
          Provide reason for leave and contact information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reason for Leave</CardTitle>
          <CardDescription>Explain why you need this leave</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason / Grounds for Leave *
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for your leave application..."
              value={reasonForLeave}
              onChange={(e) => onUpdate({ reasonForLeave: e.target.value })}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {reasonForLeave.length} characters
            </p>
          </div>

          {/* Medical Leave Toggle (if applicable) */}
          {!isMedicalLeaveType && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor="medical-toggle" className="cursor-pointer">
                  Is this for medical reasons?
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Medical certificate will be required if yes
                </p>
              </div>
              <Switch
                id="medical-toggle"
                checked={isMedicalLeave}
                onCheckedChange={(checked) => onUpdate({ isMedicalLeave: checked })}
              />
            </div>
          )}

          {(isMedicalLeave || isMedicalLeaveType) && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You will need to upload a medical certificate in the next step
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Where can we reach you during leave?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">
              Address During Leave *
            </Label>
            <Textarea
              id="address"
              placeholder="Enter your full address during leave period..."
              value={leaveAddress}
              onChange={(e) => onUpdate({ leaveAddress: e.target.value })}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include complete address with pin code
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">
              Contact Number *
            </Label>
            <Input
              id="contact"
              type="tel"
              placeholder="+91 98765 43210"
              value={contactNumber}
              onChange={(e) => onUpdate({ contactNumber: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Mobile number where you can be reached
            </p>
          </div>

          {user && (
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee ID</span>
                <span className="font-medium">{user.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Designation</span>
                <span className="font-medium">{user.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Office</span>
                <span className="font-medium">{user.office}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg flex justify-between gap-3 z-50">
        <Button variant="outline" onClick={onBack} className="flex-1 sm:flex-none">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="flex-1 sm:flex-none"
        >
          Next: Upload Documents
        </Button>
      </div>
    </div>
  );
}
