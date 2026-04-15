import type {
  LeaveApplication,
  LeaveType,
  LeaveBalance,
  LeaveApplicationFormData,
  ApplicationStatus,
  WorkflowHistoryItem,
} from '../types';
import { LEAVE_TYPES, LEAVE_BALANCES, getLeaveTypeById } from './mockData';
import { authService } from './auth.service';

const APPLICATIONS_KEY = 'aptransco_applications';
const MOCK_DELAY = 600;

// Utility to generate IDs
function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

class LeaveService {
  private delay(ms: number = MOCK_DELAY) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get all applications from storage
  private getAllApplications(): LeaveApplication[] {
    const stored = localStorage.getItem(APPLICATIONS_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  // Save applications to storage
  private saveApplications(applications: LeaveApplication[]): void {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
  }

  // Get leave types
  async getLeaveTypes(): Promise<LeaveType[]> {
    await this.delay(300);
    return LEAVE_TYPES.filter((lt) => lt.isActive);
  }

  // Get leave balance for user
  async getLeaveBalance(userId: string, leaveTypeId: string): Promise<LeaveBalance | null> {
    await this.delay(300);
    const balance = LEAVE_BALANCES.find(
      (lb) => lb.userId === userId && lb.leaveTypeId === leaveTypeId
    );
    return balance || null;
  }

  // Get all leave balances for a user
  async getLeaveBalances(userId: string): Promise<LeaveBalance[]> {
    await this.delay(400);
    return LEAVE_BALANCES.filter((lb) => lb.userId === userId);
  }

  // Get applications by user
  async getApplicationsByUser(userId: string): Promise<LeaveApplication[]> {
    await this.delay(500);
    const allApplications = this.getAllApplications();
    return allApplications.filter((app) => app.userId === userId);
  }

  // Get application by ID
  async getApplicationById(applicationId: string): Promise<LeaveApplication | null> {
    await this.delay(400);
    const allApplications = this.getAllApplications();
    return allApplications.find((app) => app.applicationId === applicationId) || null;
  }

  // Check eligibility
  async checkEligibility(
    userId: string,
    leaveTypeId: string,
    days: number
  ): Promise<{ isEligible: boolean; reason?: string }> {
    await this.delay(400);

    const leaveType = getLeaveTypeById(leaveTypeId);
    if (!leaveType) {
      return { isEligible: false, reason: 'Invalid leave type' };
    }

    const balance = await this.getLeaveBalance(userId, leaveTypeId);
    if (!balance) {
      return { isEligible: false, reason: 'No leave balance found for this leave type' };
    }

    if (balance.balance < days) {
      return {
        isEligible: false,
        reason: `Insufficient balance. Available: ${balance.balance} days, Requested: ${days} days`,
      };
    }

    if (leaveType.maxDaysPerSpell && days > leaveType.maxDaysPerSpell) {
      return {
        isEligible: false,
        reason: `Exceeds maximum days per spell. Maximum allowed: ${leaveType.maxDaysPerSpell} days`,
      };
    }

    return { isEligible: true };
  }

  // Create draft application
  async createDraftApplication(userId: string, leaveTypeId: string): Promise<LeaveApplication> {
    await this.delay(500);

    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newApplication: LeaveApplication = {
      applicationId: generateId('app'),
      userId,
      leaveTypeId,
      applicationDate: new Date().toISOString(),
      leaveFromDate: '',
      leaveFromSession: 'FN',
      leaveToDate: '',
      leaveToSession: 'AN',
      leaveDays: 0,
      totalDays: 0,
      reasonForLeave: '',
      leaveAddress: '',
      contactNumber: user.mobile,
      isMedicalLeave: false,
      status: 'Draft',
      currentStage: 'Employee',
      workflowHistory: [],
      attachments: [],
      balanceAtApplication: 0,
      balanceAfterAvailing: 0,
      isEligible: false,
      applicableRegulations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allApplications = this.getAllApplications();
    allApplications.push(newApplication);
    this.saveApplications(allApplications);

    return newApplication;
  }

  // Update application
  async updateApplication(
    applicationId: string,
    updates: Partial<LeaveApplication>
  ): Promise<LeaveApplication> {
    await this.delay(500);

    const allApplications = this.getAllApplications();
    const index = allApplications.findIndex((app) => app.applicationId === applicationId);

    if (index === -1) {
      throw new Error('Application not found');
    }

    allApplications[index] = {
      ...allApplications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveApplications(allApplications);
    return allApplications[index];
  }

  // Submit application
  async submitApplication(applicationId: string): Promise<LeaveApplication> {
    await this.delay(800);

    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const allApplications = this.getAllApplications();
    const index = allApplications.findIndex((app) => app.applicationId === applicationId);

    if (index === -1) {
      throw new Error('Application not found');
    }

    const application = allApplications[index];

    // Add workflow history
    const historyItem: WorkflowHistoryItem = {
      historyId: generateId('hist'),
      applicationId,
      stage: 'Employee',
      action: 'Submitted',
      status: 'Submitted',
      actionBy: user.userId,
      actionByName: user.name,
      actionByRole: user.role,
      actionDate: new Date().toISOString(),
    };

    allApplications[index] = {
      ...application,
      status: 'Submitted',
      currentStage: 'ControllingOfficer',
      workflowHistory: [...application.workflowHistory, historyItem],
      updatedAt: new Date().toISOString(),
    };

    this.saveApplications(allApplications);
    return allApplications[index];
  }

  // Forward application (CO action)
  async forwardApplication(
    applicationId: string,
    remarks?: string
  ): Promise<LeaveApplication> {
    await this.delay(700);

    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const allApplications = this.getAllApplications();
    const index = allApplications.findIndex((app) => app.applicationId === applicationId);

    if (index === -1) {
      throw new Error('Application not found');
    }

    const application = allApplications[index];

    const historyItem: WorkflowHistoryItem = {
      historyId: generateId('hist'),
      applicationId,
      stage: 'ControllingOfficer',
      action: 'Forwarded',
      status: 'Forwarded',
      actionBy: user.userId,
      actionByName: user.name,
      actionByRole: user.role,
      remarks,
      actionDate: new Date().toISOString(),
    };

    allApplications[index] = {
      ...application,
      status: 'Forwarded',
      currentStage: 'HR',
      workflowHistory: [...application.workflowHistory, historyItem],
      updatedAt: new Date().toISOString(),
    };

    this.saveApplications(allApplications);
    return allApplications[index];
  }

  // Return application for correction
  async returnApplication(
    applicationId: string,
    remarks: string
  ): Promise<LeaveApplication> {
    await this.delay(700);

    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const allApplications = this.getAllApplications();
    const index = allApplications.findIndex((app) => app.applicationId === applicationId);

    if (index === -1) {
      throw new Error('Application not found');
    }

    const application = allApplications[index];

    const historyItem: WorkflowHistoryItem = {
      historyId: generateId('hist'),
      applicationId,
      stage: application.currentStage,
      action: 'Returned',
      status: 'ReturnedForCorrection',
      actionBy: user.userId,
      actionByName: user.name,
      actionByRole: user.role,
      remarks,
      actionDate: new Date().toISOString(),
    };

    allApplications[index] = {
      ...application,
      status: 'ReturnedForCorrection',
      currentStage: 'Employee',
      workflowHistory: [...application.workflowHistory, historyItem],
      updatedAt: new Date().toISOString(),
    };

    this.saveApplications(allApplications);
    return allApplications[index];
  }

  // Get pending applications for a role
  async getPendingApplications(stage: string): Promise<LeaveApplication[]> {
    await this.delay(500);

    const allApplications = this.getAllApplications();
    return allApplications.filter((app) => app.currentStage === stage);
  }

  // Get dashboard stats for a user
  async getDashboardStats(userId: string): Promise<{
    pending: number;
    sanctioned: number;
    rejected: number;
    total: number;
  }> {
    await this.delay(400);

    const userApplications = await this.getApplicationsByUser(userId);

    return {
      pending: userApplications.filter((app) =>
        ['Submitted', 'UnderReview', 'Forwarded', 'UnderVerification', 'PendingSanction'].includes(
          app.status
        )
      ).length,
      sanctioned: userApplications.filter((app) => app.status === 'Sanctioned').length,
      rejected: userApplications.filter((app) => app.status === 'Rejected').length,
      total: userApplications.length,
    };
  }
}

export const leaveService = new LeaveService();
