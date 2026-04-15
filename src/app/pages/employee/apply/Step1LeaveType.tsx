import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../../components/ui/drawer';
import { useAuth } from '../../../context/AuthContext';
import { leaveService } from '../../../services/leave.service';
import { getEligibleLeaveTypes, LEAVE_TYPES } from '../../../services/mockData';
import type { LeaveType, LeaveBalance } from '../../../types';
import { CheckCircle2, XCircle, Info, Calendar } from 'lucide-react';

interface Step1Props {
  selectedLeaveType: string;
  onLeaveTypeSelect: (leaveTypeId: string) => void;
  onNext: () => void;
}

export function Step1LeaveType({ selectedLeaveType, onLeaveTypeSelect, onNext }: Step1Props) {
  const { user } = useAuth();
  const [eligibleTypes, setEligibleTypes] = useState<LeaveType[]>([]);
  const [ineligibleTypes, setIneligibleTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Record<string, LeaveBalance>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaveTypes();
  }, [user]);

  const loadLeaveTypes = async () => {
    if (!user) return;

    try {
      const eligible = getEligibleLeaveTypes(user);
      const allTypes = LEAVE_TYPES.filter((lt) => lt.isActive);
      const ineligible = allTypes.filter(
        (lt) => !eligible.find((e) => e.leaveTypeId === lt.leaveTypeId)
      );

      setEligibleTypes(eligible);
      setIneligibleTypes(ineligible);

      // Load balances for eligible types
      const balanceMap: Record<string, LeaveBalance> = {};
      for (const type of eligible) {
        const balance = await leaveService.getLeaveBalance(user.userId, type.leaveTypeId);
        if (balance) {
          balanceMap[type.leaveTypeId] = balance;
        }
      }
      setBalances(balanceMap);
    } catch (error) {
      console.error('Failed to load leave types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPayTypeBadge = (payType: string) => {
    switch (payType) {
      case 'FullPay':
        return <Badge variant="default" className="bg-green-600">Full Pay</Badge>;
      case 'HalfPay':
        return <Badge variant="secondary">Half Pay</Badge>;
      case 'NoPay':
        return <Badge variant="outline">No Pay</Badge>;
      default:
        return null;
    }
  };

  const getIneligibilityReason = (leaveType: LeaveType): string => {
    if (leaveType.genderRestriction && leaveType.genderRestriction !== user?.gender) {
      return `Only available for ${leaveType.genderRestriction.toLowerCase()} employees`;
    }

    if (leaveType.minServiceYears && user) {
      const joinDate = new Date(user.dateOfJoining);
      const now = new Date();
      const yearsOfService = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (yearsOfService < leaveType.minServiceYears) {
        return `Requires ${leaveType.minServiceYears} years of service (you have ${Math.floor(yearsOfService)} years)`;
      }
    }

    return 'Not eligible';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading leave types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Leave Type</h2>
        <p className="text-muted-foreground">
          Choose the type of leave you want to apply for. Green cards show leave types you're eligible for.
        </p>
      </div>

      {/* Eligible Leave Types */}
      <div>
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
          Available Leave Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eligibleTypes.map((leaveType) => {
            const balance = balances[leaveType.leaveTypeId];
            const isSelected = selectedLeaveType === leaveType.leaveTypeId;

            return (
              <Card
                key={leaveType.leaveTypeId}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => onLeaveTypeSelect(leaveType.leaveTypeId)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {leaveType.name}
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {leaveType.code}
                      </CardDescription>
                    </div>
                    {getPayTypeBadge(leaveType.payType)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {leaveType.description}
                  </p>

                  {balance && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Available Balance</span>
                      <span className="text-lg font-bold text-primary">
                        {balance.balance} days
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max per spell</span>
                    <span className="font-medium">
                      {leaveType.maxDaysPerSpell || 'Unlimited'} days
                    </span>
                  </div>

                  {leaveType.minDaysNotice > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {leaveType.minDaysNotice} days advance notice required
                    </div>
                  )}

                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Info className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>{leaveType.name}</DrawerTitle>
                        <DrawerDescription>{leaveType.description}</DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Leave Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Pay Type</span>
                              <span>{leaveType.payType.replace('Pay', ' Pay')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Days Per Spell</span>
                              <span>{leaveType.maxDaysPerSpell || 'Unlimited'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Days Per Year</span>
                              <span>{leaveType.maxDaysPerYear || 'Unlimited'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Advance Notice</span>
                              <span>{leaveType.minDaysNotice} days</span>
                            </div>
                          </div>
                        </div>

                        {leaveType.requiredDocuments.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Required Documents</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {leaveType.requiredDocuments.map((doc, idx) => (
                                <li key={idx} className="text-muted-foreground">{doc}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {leaveType.applicableRegulations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Applicable Regulations</h4>
                            <div className="flex gap-2 flex-wrap">
                              {leaveType.applicableRegulations.map((reg, idx) => (
                                <Badge key={idx} variant="outline">{reg}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {balance && (
                          <div>
                            <h4 className="font-medium mb-2">Your Balance ({balance.year})</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="p-2 bg-muted rounded">
                                <div className="text-muted-foreground">Opening</div>
                                <div className="font-medium">{balance.openingBalance}</div>
                              </div>
                              <div className="p-2 bg-muted rounded">
                                <div className="text-muted-foreground">Credits</div>
                                <div className="font-medium">{balance.credits}</div>
                              </div>
                              <div className="p-2 bg-muted rounded">
                                <div className="text-muted-foreground">Availed</div>
                                <div className="font-medium">{balance.availed}</div>
                              </div>
                              <div className="p-2 bg-primary/10 rounded">
                                <div className="text-muted-foreground">Balance</div>
                                <div className="font-bold text-primary">{balance.balance}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DrawerContent>
                  </Drawer>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Ineligible Leave Types */}
      {ineligibleTypes.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center text-muted-foreground">
            <XCircle className="w-5 h-5 mr-2" />
            Not Available
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ineligibleTypes.map((leaveType) => (
              <Card key={leaveType.leaveTypeId} className="opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-muted-foreground">
                        {leaveType.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {leaveType.code}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      Not Eligible
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {getIneligibilityReason(leaveType)}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!selectedLeaveType}
          size="lg"
        >
          Next: Enter Dates
        </Button>
      </div>
    </div>
  );
}
