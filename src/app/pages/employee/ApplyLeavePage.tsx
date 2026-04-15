import { useState } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Stepper } from '../../components/Stepper';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Step1LeaveType } from './apply/Step1LeaveType';
import { Step2Dates, type Step2Data } from './apply/Step2Dates';
import { Step3Grounds, type Step3Data } from './apply/Step3Grounds';
import { Step4Documents } from './apply/Step4Documents';
import { Step5Eligibility } from './apply/Step5Eligibility';
import { Step6Review } from './apply/Step6Review';
import { getLeaveTypeById } from '../../services/mockData';
import type { Session } from '../../types';

const STEPS = [
  { id: 1, title: 'Leave Type', description: 'Select type' },
  { id: 2, title: 'Dates', description: 'Choose period' },
  { id: 3, title: 'Details', description: 'Enter info' },
  { id: 4, title: 'Documents', description: 'Upload files' },
  { id: 5, title: 'Eligibility', description: 'Verify' },
  { id: 6, title: 'Review', description: 'Submit' },
];

export function ApplyLeavePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState<{
    leaveTypeId: string;
    leaveFromDate: string;
    leaveFromSession: Session;
    leaveToDate: string;
    leaveToSession: Session;
    prefixFromDate?: string;
    prefixToDate?: string;
    suffixFromDate?: string;
    suffixToDate?: string;
    leaveDays: number;
    totalDays: number;
    reasonForLeave: string;
    leaveAddress: string;
    contactNumber: string;
    isMedicalLeave: boolean;
    documents: File[];
  }>({
    leaveTypeId: '',
    leaveFromDate: '',
    leaveFromSession: 'FN',
    leaveToDate: '',
    leaveToSession: 'AN',
    leaveDays: 0,
    totalDays: 0,
    reasonForLeave: '',
    leaveAddress: '',
    contactNumber: '',
    isMedicalLeave: false,
    documents: [],
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const leaveType = formData.leaveTypeId
    ? getLeaveTypeById(formData.leaveTypeId)
    : null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">Apply for Leave</h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Complete the wizard to submit your leave application
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4">
          <Stepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && (
            <Step1LeaveType
              selectedLeaveType={formData.leaveTypeId}
              onLeaveTypeSelect={(leaveTypeId) =>
                updateFormData({ leaveTypeId })
              }
              onNext={nextStep}
            />
          )}

          {currentStep === 1 && (
            <Step2Dates
              leaveFromDate={formData.leaveFromDate}
              leaveFromSession={formData.leaveFromSession}
              leaveToDate={formData.leaveToDate}
              leaveToSession={formData.leaveToSession}
              prefixFromDate={formData.prefixFromDate}
              prefixToDate={formData.prefixToDate}
              suffixFromDate={formData.suffixFromDate}
              suffixToDate={formData.suffixToDate}
              onUpdate={(data) => updateFormData(data)}
              onNext={nextStep}
              onBack={previousStep}
              leaveType={leaveType}
            />
          )}

          {currentStep === 2 && (
            <Step3Grounds
              reasonForLeave={formData.reasonForLeave}
              leaveAddress={formData.leaveAddress}
              contactNumber={formData.contactNumber}
              isMedicalLeave={formData.isMedicalLeave}
              onUpdate={(data) => updateFormData(data)}
              onNext={nextStep}
              onBack={previousStep}
              leaveType={leaveType}
            />
          )}

          {currentStep === 3 && (
            <Step4Documents
              documents={formData.documents}
              onUpdate={(data) => updateFormData(data)}
              onNext={nextStep}
              onBack={previousStep}
              leaveType={leaveType}
              isMedicalLeave={formData.isMedicalLeave}
            />
          )}

          {currentStep === 4 && (
            <Step5Eligibility
              leaveTypeId={formData.leaveTypeId}
              totalDays={formData.totalDays}
              onNext={nextStep}
              onBack={previousStep}
              leaveType={leaveType}
            />
          )}

          {currentStep === 5 && (
            <Step6Review
              formData={formData}
              onBack={previousStep}
              leaveType={leaveType}
            />
          )}
        </div>
      </div>
    </div>
  );
}
