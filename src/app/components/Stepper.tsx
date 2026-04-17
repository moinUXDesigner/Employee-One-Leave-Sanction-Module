import { Check } from 'lucide-react';
import { cn } from './ui/utils';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-4">
      {/* Mobile: Compact stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps[currentStep].title}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = onStepClick && (isCompleted || isCurrent);

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step circle */}
                <button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex flex-col items-center relative',
                    isClickable && 'cursor-pointer hover:opacity-80'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                      isCompleted &&
                        'bg-primary border-primary text-primary-foreground',
                      isCurrent &&
                        'bg-background border-primary text-primary',
                      !isCompleted &&
                        !isCurrent &&
                        'bg-muted border-muted-foreground/30 text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-1.5 text-center">
                    <div
                      className={cn(
                        'text-xs font-medium',
                        isCurrent && 'text-primary',
                        isCompleted && 'text-foreground',
                        !isCompleted &&
                          !isCurrent &&
                          'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </div>
                  </div>
                </button>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-3 mb-6">
                    <div
                      className={cn(
                        'h-full transition-all',
                        index < currentStep ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
