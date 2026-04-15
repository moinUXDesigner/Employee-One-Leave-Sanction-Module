import { useState } from 'react';
import { useNavigate } from '../../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import { useAuth } from '../../../context/AuthContext';
import { leaveService } from '../../../services/leave.service';
import { formatDate, formatSession, formatDaysDisplay } from '../../../utils/leaveCalculations';
import { CheckCircle2, AlertTriangle, FileText, Calendar, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Step6Props {
  formData: any;
  onBack: () => void;
  leaveType: any;
}

export function Step6Review({ formData, onBack, leaveType }: Step6Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!user || !agreed) return;

    setIsSubmitting(true);

    try {
      // Create draft application
      const application = await leaveService.createDraftApplication(
        user.userId,
        formData.leaveTypeId
      );

      // Update with form data
      await leaveService.updateApplication(application.applicationId, {
        leaveFromDate: formData.leaveFromDate,
        leaveFromSession: formData.leaveFromSession,
        leaveToDate: formData.leaveToDate,
        leaveToSession: formData.leaveToSession,
        prefixFromDate: formData.prefixFromDate,
        prefixToDate: formData.prefixToDate,
        suffixFromDate: formData.suffixFromDate,
        suffixToDate: formData.suffixToDate,
        leaveDays: formData.leaveDays,
        totalDays: formData.totalDays,
        reasonForLeave: formData.reasonForLeave,
        leaveAddress: formData.leaveAddress,
        contactNumber: formData.contactNumber,
        isMedicalLeave: formData.isMedicalLeave,
        isEligible: true,
        applicableRegulations: leaveType?.applicableRegulations || [],
      });

      // Submit application
      await leaveService.submitApplication(application.applicationId);

      toast.success('Leave Application Submitted', {
        description: 'Your application has been submitted successfully and forwarded to your controlling officer.',
      });

      // Navigate to applications list
      navigate('/employee/applications');
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error('Submission Failed', {
        description: error instanceof Error ? error.message : 'Failed to submit application',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
        <p className="text-muted-foreground">
          Please review all details before submitting your application
        </p>
      </div>

      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Name</div>
            <div className="font-medium">{user?.name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Employee ID</div>
            <div className="font-medium">{user?.employeeId}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Designation</div>
            <div className="font-medium">{user?.designation}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Department</div>
            <div className="font-medium">{user?.department}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-muted-foreground">Office</div>
            <div className="font-medium">{user?.office}, {user?.zone}</div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Details</CardTitle>
            <Badge className="text-base px-3 py-1">
              {leaveType?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="font-medium mb-2">Leave Period</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">From</div>
                  <div className="font-medium">
                    {formatDate(formData.leaveFromDate)} ({formatSession(formData.leaveFromSession)})
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">To</div>
                  <div className="font-medium">
                    {formatDate(formData.leaveToDate)} ({formatSession(formData.leaveToSession)})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {formData.prefixFromDate && (
            <div className="pl-8 border-l-2 border-primary/30">
              <div className="text-sm text-muted-foreground mb-1">Prefix Holidays</div>
              <div className="text-sm">
                {formatDate(formData.prefixFromDate)} to {formatDate(formData.prefixToDate)}
              </div>
            </div>
          )}

          {formData.suffixFromDate && (
            <div className="pl-8 border-l-2 border-primary/30">
              <div className="text-sm text-muted-foreground mb-1">Suffix Holidays</div>
              <div className="text-sm">
                {formatDate(formData.suffixFromDate)} to {formatDate(formData.suffixToDate)}
              </div>
            </div>
          )}

          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Days</span>
              <span className="text-2xl font-bold text-primary">
                {formatDaysDisplay(formData.totalDays)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reason & Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Reason & Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Reason for Leave</div>
            <div className="p-3 bg-muted rounded-lg">
              {formData.reasonForLeave}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Address During Leave</div>
              <div className="p-3 bg-muted rounded-lg">
                {formData.leaveAddress}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Contact Number</div>
              <div className="font-medium">{formData.contactNumber}</div>
            </div>
          </div>

          {formData.isMedicalLeave && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This is a medical leave. Medical certificate has been attached.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Attached Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.documents && formData.documents.length > 0 ? (
            <div className="space-y-2">
              {formData.documents.map((file: File, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Badge variant="outline">Uploaded</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No documents attached
            </p>
          )}
        </CardContent>
      </Card>

      {/* Declaration */}
      <Card className="border-primary">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="declaration"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <div className="flex-1">
              <Label
                htmlFor="declaration"
                className="text-sm cursor-pointer leading-relaxed"
              >
                I hereby declare that the information provided in this application is true and
                correct to the best of my knowledge. I understand that any false information may
                result in rejection of this application or disciplinary action.
              </Label>
            </div>
          </div>

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your application will be forwarded to <strong>{user?.controllingOfficer || 'your controlling officer'}</strong> for review
              after submission.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!agreed || isSubmitting}
          size="lg"
          className="min-w-40"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
