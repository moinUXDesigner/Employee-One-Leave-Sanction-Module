import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Alert,
  AlertDescription,
} from "../../../components/ui/alert";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../components/ui/radio-group";
import { Switch } from "../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { Session } from "../../../types";
import {
  calculateLeaveDays,
  calculateTotalDays,
  formatDaysDisplay,
  getDateValidationError,
} from "../../../utils/leaveCalculations";
import { Calendar, AlertCircle, Info } from "lucide-react";

interface Step2Props {
  leaveFromDate: string;
  leaveFromSession: Session;
  leaveToDate: string;
  leaveToSession: Session;
  prefixFromDate?: string;
  prefixToDate?: string;
  suffixFromDate?: string;
  suffixToDate?: string;
  onUpdate: (data: Partial<Step2Data>) => void;
  onNext: () => void;
  onBack: () => void;
  leaveType: any;
}

export interface Step2Data {
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
}

export function Step2Dates({
  leaveFromDate,
  leaveFromSession,
  leaveToDate,
  leaveToSession,
  prefixFromDate,
  prefixToDate,
  suffixFromDate,
  suffixToDate,
  onUpdate,
  onNext,
  onBack,
  leaveType,
}: Step2Props) {
  const [showPrefix, setShowPrefix] = useState(false);
  const [showSuffix, setShowSuffix] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );

  const leaveDays = calculateLeaveDays(
    leaveFromDate,
    leaveFromSession,
    leaveToDate,
    leaveToSession,
  );

  const prefixDays =
    prefixFromDate && prefixToDate
      ? calculateLeaveDays(
          prefixFromDate,
          "FN",
          prefixToDate,
          "AN",
        )
      : 0;

  const suffixDays =
    suffixFromDate && suffixToDate
      ? calculateLeaveDays(
          suffixFromDate,
          "FN",
          suffixToDate,
          "AN",
        )
      : 0;

  const totalDays = calculateTotalDays(
    prefixDays,
    leaveDays,
    suffixDays,
  );

  useEffect(() => {
    // Validate and update
    const newErrors: Record<string, string> = {};

    const dateError = getDateValidationError(
      leaveFromDate,
      leaveToDate,
    );
    if (dateError) {
      newErrors.dates = dateError;
    }

    // Check max days per spell
    if (
      leaveType?.maxDaysPerSpell &&
      totalDays > leaveType.maxDaysPerSpell
    ) {
      newErrors.maxDays = `Total days (${totalDays}) exceeds maximum allowed per spell (${leaveType.maxDaysPerSpell} days)`;
    }

    setErrors(newErrors);

    // Update parent
    onUpdate({
      leaveFromDate,
      leaveFromSession,
      leaveToDate,
      leaveToSession,
      prefixFromDate: showPrefix ? prefixFromDate : undefined,
      prefixToDate: showPrefix ? prefixToDate : undefined,
      suffixFromDate: showSuffix ? suffixFromDate : undefined,
      suffixToDate: showSuffix ? suffixToDate : undefined,
      leaveDays,
      totalDays,
    });
  }, [
    leaveFromDate,
    leaveFromSession,
    leaveToDate,
    leaveToSession,
    prefixFromDate,
    prefixToDate,
    suffixFromDate,
    suffixToDate,
    showPrefix,
    showSuffix,
    leaveDays,
    totalDays,
    leaveType,
  ]);

  const handleNext = () => {
    if (Object.keys(errors).length === 0 && leaveDays > 0) {
      onNext();
    }
  };

  const canShowPrefixSuffix = leaveType?.prefixSuffixAllowed;

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          Select Dates & Duration
        </h2>
        <p className="text-muted-foreground">
          Choose the leave period and session timings
        </p>
      </div>

      {/* Main Leave Period */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Leave Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* From and To Date in single row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex gap-2 items-end">
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="fromDate" className="text-xs">
                  From Date *
                </Label>
                <div className="relative">
                  <Input
                    id="fromDate"
                    type="date"
                    value={leaveFromDate}
                    onChange={(e) =>
                      onUpdate({ leaveFromDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="h-10 w-full pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <Select
                value={leaveFromSession}
                onValueChange={(value) =>
                  onUpdate({
                    leaveFromSession: value as Session,
                  })
                }
              >
                <SelectTrigger className="w-20 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FN">FN</SelectItem>
                  <SelectItem value="AN">AN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-end">
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="toDate" className="text-xs">
                  To Date *
                </Label>
                <div className="relative">
                  <Input
                    id="toDate"
                    type="date"
                    value={leaveToDate}
                    onChange={(e) =>
                      onUpdate({ leaveToDate: e.target.value })
                    }
                    min={
                      leaveFromDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="h-10 w-full pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <Select
                value={leaveToSession}
                onValueChange={(value) =>
                  onUpdate({ leaveToSession: value as Session })
                }
              >
                <SelectTrigger className="w-20 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FN">FN</SelectItem>
                  <SelectItem value="AN">AN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Days Calculation */}
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Leave Days
              </span>
              <span className="text-xl font-bold text-primary">
                {formatDaysDisplay(leaveDays)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prefix/Suffix (if allowed) */}
      {canShowPrefixSuffix && (
        <Card>
          <CardHeader>
            <CardTitle>
              Prefix & Suffix Holidays (Optional)
            </CardTitle>
            <CardDescription>
              Include holidays before or after your leave period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prefix Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label
                  htmlFor="prefix-toggle"
                  className="cursor-pointer"
                >
                  Include Prefix Holidays
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Holidays before leave period
                </p>
              </div>
              <Switch
                id="prefix-toggle"
                checked={showPrefix}
                onCheckedChange={setShowPrefix}
              />
            </div>

            {showPrefix && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary">
                <div className="space-y-2">
                  <Label htmlFor="prefixFrom">
                    Prefix From
                  </Label>
                  <div className="relative">
                    <Input
                      id="prefixFrom"
                      type="date"
                      value={prefixFromDate || ""}
                      onChange={(e) =>
                        onUpdate({
                          prefixFromDate: e.target.value,
                        })
                      }
                      max={leaveFromDate}
                      className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefixTo">Prefix To</Label>
                  <div className="relative">
                    <Input
                      id="prefixTo"
                      type="date"
                      value={prefixToDate || ""}
                      onChange={(e) =>
                        onUpdate({ prefixToDate: e.target.value })
                      }
                      max={leaveFromDate}
                      className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                {prefixDays > 0 && (
                  <div className="col-span-2 text-sm text-muted-foreground">
                    Prefix days: {formatDaysDisplay(prefixDays)}
                  </div>
                )}
              </div>
            )}

            {/* Suffix Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label
                  htmlFor="suffix-toggle"
                  className="cursor-pointer"
                >
                  Include Suffix Holidays
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Holidays after leave period
                </p>
              </div>
              <Switch
                id="suffix-toggle"
                checked={showSuffix}
                onCheckedChange={setShowSuffix}
              />
            </div>

            {showSuffix && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary">
                <div className="space-y-2">
                  <Label htmlFor="suffixFrom">
                    Suffix From
                  </Label>
                  <div className="relative">
                    <Input
                      id="suffixFrom"
                      type="date"
                      value={suffixFromDate || ""}
                      onChange={(e) =>
                        onUpdate({
                          suffixFromDate: e.target.value,
                        })
                      }
                      min={leaveToDate}
                      className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suffixTo">Suffix To</Label>
                  <div className="relative">
                    <Input
                      id="suffixTo"
                      type="date"
                      value={suffixToDate || ""}
                      onChange={(e) =>
                        onUpdate({ suffixToDate: e.target.value })
                      }
                      min={leaveToDate}
                      className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                {suffixDays > 0 && (
                  <div className="col-span-2 text-sm text-muted-foreground">
                    Suffix days: {formatDaysDisplay(suffixDays)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Total Summary */}
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                Total Days
              </h3>
              <p className="text-sm text-muted-foreground">
                {prefixDays > 0 &&
                  `${formatDaysDisplay(prefixDays)} prefix + `}
                {formatDaysDisplay(leaveDays)} leave
                {suffixDays > 0 &&
                  ` + ${formatDaysDisplay(suffixDays)} suffix`}
              </p>
            </div>
            <div className="text-4xl font-bold text-primary">
              {formatDaysDisplay(totalDays)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors and Warnings */}
      {errors.dates && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.dates}</AlertDescription>
        </Alert>
      )}

      {errors.maxDays && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.maxDays}</AlertDescription>
        </Alert>
      )}

      {leaveType?.medicalCertificateRequired && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Medical certificate will be required in the next
            steps
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-background border-t shadow-lg flex justify-between gap-3 z-50">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 sm:flex-none"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            Object.keys(errors).length > 0 || leaveDays === 0
          }
          size="lg"
          className="flex-1 sm:flex-none"
        >
          Next: Enter Details
        </Button>
      </div>
    </div>
  );
}