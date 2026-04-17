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
        <div className="space-y-2 -mx-4 sm:mx-0">
          {eligibleTypes.map((leaveType, index) => {
            const balance = balances[leaveType.leaveTypeId];
            const isSelected = selectedLeaveType === leaveType.leaveTypeId;

            return (
              <div
                key={leaveType.leaveTypeId}
                className={`
                  relative overflow-hidden transition-all active:scale-[0.98]
                  ${isSelected ? 'bg-primary/5' : 'bg-background hover:bg-muted/50'}
                  ${index > 0 ? 'border-t' : ''}
                `}
              >
                <div
                  className={`
                    py-3 px-4 cursor-pointer select-none 
                    ${isSelected ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                  `}
                  onClick={() => onLeaveTypeSelect(leaveType.leaveTypeId)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm leading-tight">
                          {leaveType.name}
                        </h3>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>{leaveType.code}</span>
                        <span>•</span>
                        <span>Max {leaveType.maxDaysPerSpell || '∞'}/spell</span>
                        {leaveType.minDaysNotice > 0 && (
                          <>
                            <span>•</span>
                            <span>{leaveType.minDaysNotice}d notice</span>
                          </>
                        )}
                      </div>
                    </div>
                    {balance && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-primary leading-none">
                          {balance.balance}
                        </div>
                        <div className="text-[10px] text-muted-foreground">days</div>
                      </div>
                    )}
                    <Drawer>
                      <DrawerTrigger asChild>
                        <button
                          className="p-1.5 text-muted-foreground hover:text-primary active:scale-95 transition-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>{leaveType.name}</DrawerTitle>
                          <DrawerDescription>{leaveType.description}</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ineligible Leave Types - Hidden */}

      {/* Next Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg flex justify-end z-50">
        <Button
          onClick={onNext}
          disabled={!selectedLeaveType}
          size="lg"
          className="flex-1 sm:flex-none"
        >
          Next: Enter Dates
        </Button>
      </div>
    </div>
  );
}
