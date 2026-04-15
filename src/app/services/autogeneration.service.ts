import type { LeaveApplication, User, LeaveType, LeaveBalance, Regulation } from '../types';
import { formatDate, formatSession } from '../utils/leaveCalculations';
import { getUserById, getLeaveTypeById, REGULATIONS } from './mockData';
import { leaveService } from './leave.service';

const MOCK_DELAY = 1000;

interface GenerateNoteParams {
  application: LeaveApplication;
  user: User;
  leaveType: LeaveType;
  balance: LeaveBalance;
  regulations: Regulation[];
}

interface GenerateOrderParams {
  application: LeaveApplication;
  user: User;
  leaveType: LeaveType;
  balance: LeaveBalance;
  regulations: Regulation[];
  controllingOfficer?: User;
}

class AutoGenerationService {
  private delay(ms: number = MOCK_DELAY) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate Internal Note
   */
  async generateInternalNote(params: GenerateNoteParams): Promise<string> {
    await this.delay();

    const { application, user, leaveType, balance, regulations } = params;

    const balanceAfterAvailing = balance.balance - application.totalDays;
    const regulationNumbers = regulations.map((r) => r.regulationNumber).join(', ');

    const noteContent = `TO: Personnel Officer / Sanctioning Authority
FROM: Assistant Personnel Officer / HR
DATE: ${formatDate(new Date().toISOString(), 'dd MMMM yyyy')}
SUBJECT: Leave application of ${user.name}, ${user.designation} - ${leaveType.name}

*****

REFERENCE:
1. Leave Application dated ${formatDate(application.applicationDate, 'dd MMMM yyyy')}
2. Employee ID: ${user.employeeId}
3. Designation: ${user.designation}
4. Office: ${user.office}, ${user.zone}

DETAILS:

${user.name}, ${user.designation}, ${user.office} has applied for ${leaveType.name} for a period of ${application.totalDays} days from ${formatDate(application.leaveFromDate, 'dd MMMM yyyy')} (${formatSession(application.leaveFromSession)}) to ${formatDate(application.leaveToDate, 'dd MMMM yyyy')} (${formatSession(application.leaveToSession)})${application.prefixFromDate ? ` including prefix holidays from ${formatDate(application.prefixFromDate)} to ${formatDate(application.prefixToDate!)}` : ''}${application.suffixFromDate ? ` and suffix holidays from ${formatDate(application.suffixFromDate)} to ${formatDate(application.suffixToDate!)}` : ''}.

GROUNDS:
${application.reasonForLeave}

LEAVE ADDRESS:
${application.leaveAddress}
Contact: ${application.contactNumber}

LEAVE BALANCE VERIFICATION:

Leave Type: ${leaveType.name} (${leaveType.code})
Year: ${balance.year}

Opening Balance: ${balance.openingBalance} days
Credits: ${balance.credits} days
Total Available: ${balance.totalAvailable} days
Previously Availed: ${balance.availed} days
Current Balance: ${balance.balance} days

Applied Leave: ${application.totalDays} days
Balance After Availing: ${balanceAfterAvailing} days

${balance.maxSpellsPerYear ? `Spells - Availed: ${balance.spellsAvailed}, Balance: ${balance.spellsBalance}` : ''}

ELIGIBILITY:

As per ${regulationNumbers} of APTRANSCO Leave Regulations, the employee is eligible for this leave.

${leaveType.medicalCertificateRequired ? '✓ Medical certificate has been submitted and verified.' : ''}
${leaveType.fitnessCertificateOnReturn ? '✓ Fitness certificate will be required upon return from leave.' : ''}
${leaveType.maxDaysPerSpell ? `✓ Applied days (${application.totalDays}) are within the maximum limit of ${leaveType.maxDaysPerSpell} days per spell.` : ''}
${application.isMedicalLeave ? '✓ This leave is on medical grounds.' : ''}

DOCUMENTS VERIFICATION:
${application.attachments.length > 0 ? `${application.attachments.length} document(s) have been uploaded and verified.` : 'No documents were required for this leave type.'}

RECOMMENDATION:

The application is found to be in order and is recommended for sanction as the employee has sufficient leave balance and meets all eligibility criteria as per applicable regulations.

The employee may be granted ${leaveType.name} as requested.


(Signature)
Assistant Personnel Officer / HR Officer
APTRANSCO
`;

    return noteContent;
  }

  /**
   * Generate Draft Sanction Order
   */
  async generateDraftSanctionOrder(params: GenerateOrderParams): Promise<string> {
    await this.delay(1200);

    const { application, user, leaveType, balance, regulations, controllingOfficer } = params;

    const balanceAfterAvailing = balance.balance - application.totalDays;
    const regulationNumbers = regulations.map((r) => r.regulationNumber).join(', ');
    const currentYear = new Date().getFullYear();
    const returnDate = this.calculateReturnDate(application.leaveToDate, application.leaveToSession);

    const orderContent = `ANDHRA PRADESH TRANSMISSION CORPORATION LIMITED
(APTRANSCO)
Corporate Office, Hyderabad

*****

Memo No: APTRANSCO/HR/LEAVE/${currentYear}/[TO_BE_GENERATED]
Date: [TO_BE_ISSUED]

SUBJECT: Sanction of ${leaveType.name} to ${user.name}, ${user.designation}, ${user.office}

*****

REFERENCE:
1. Leave Application dated ${formatDate(application.applicationDate, 'dd MMMM yyyy')}
2. Forwarding note from ${controllingOfficer?.name || 'Controlling Officer'} dated ${formatDate(new Date().toISOString(), 'dd MMMM yyyy')}
3. Internal Note No. [TO_BE_REFERENCED] dated ${formatDate(new Date().toISOString(), 'dd MMMM yyyy')}

*****

In exercise of the powers delegated vide APTRANSCO Order No. [DELEGATION_ORDER] and in accordance with ${regulationNumbers} of APTRANSCO Leave Regulations, sanction is hereby accorded to the grant of ${leaveType.name} to:

Name: ${user.name}
Employee ID: ${user.employeeId}
Designation: ${user.designation}
Department: ${user.department}
Office: ${user.office}
Zone: ${user.zone}

LEAVE PERIOD:

From: ${formatDate(application.leaveFromDate, 'dd MMMM yyyy')} (${formatSession(application.leaveFromSession)})
To: ${formatDate(application.leaveToDate, 'dd MMMM yyyy')} (${formatSession(application.leaveToSession)})
${application.prefixFromDate ? `\nIncluding Prefix Holidays: ${formatDate(application.prefixFromDate)} to ${formatDate(application.prefixToDate!)}` : ''}${application.suffixFromDate ? `\nIncluding Suffix Holidays: ${formatDate(application.suffixFromDate)} to ${formatDate(application.suffixToDate!)}` : ''}

Total Period: ${application.totalDays} days

PAY AND ALLOWANCES:

${user.name} is entitled to ${leaveType.payType === 'FullPay' ? 'full pay and allowances' : leaveType.payType === 'HalfPay' ? 'half pay' : 'leave without pay'} during the period of leave as admissible under the regulations.

${application.isMedicalLeave ? '\nThe Half Pay Leave is commuted to full pay on medical grounds as per medical certificate submitted.' : ''}

OFFICIATING ARRANGEMENTS:

[TO_BE_SPECIFIED_IF_REQUIRED]

RETURN TO DUTY:

${user.name} shall report for duty at ${user.office} on ${formatDate(returnDate, 'dd MMMM yyyy')} in the forenoon session.

${leaveType.fitnessCertificateOnReturn ? '\n⚠️ IMPORTANT: The employee must submit a fitness certificate from an authorized medical officer before resuming duty.' : ''}

LEAVE BALANCE:

Leave balance as on ${formatDate(new Date().toISOString(), 'dd MMMM yyyy')}:

Opening Balance (${balance.year}): ${balance.openingBalance} days
Credits: ${balance.credits} days
Previously Availed: ${balance.availed} days
Current Leave: ${application.totalDays} days
Balance after availing: ${balanceAfterAvailing} days

*****

TO:
${user.name}
${user.designation}
${user.office}

THROUGH:
${controllingOfficer?.name || '[Controlling Officer]'}
${controllingOfficer?.designation || '[Designation]'}

COPY TO:
1. The Chief Finance Officer, APTRANSCO for information and necessary action
2. The Accounts Officer for processing pay and allowances
3. SAP HR Module (Transaction ID: [SAP-TRANS-XXXX] - To be posted upon sanction)
4. Stock File
5. Personal File of ${user.name}

*****

By Order,

[SIGNATURE]
[SANCTIONING_AUTHORITY]
Personnel Officer / [Designation]
APTRANSCO
Corporate Office, Hyderabad

*****

JOINING REPORT TO BE SUBMITTED:
When ${user.name} resumes duty after leave, a joining report must be submitted through the controlling officer for record.${leaveType.fitnessCertificateOnReturn ? ' The fitness certificate must be attached with the joining report.' : ''}
`;

    return orderContent;
  }

  /**
   * Auto-select applicable regulations
   */
  async selectApplicableRegulations(leaveTypeId: string): Promise<Regulation[]> {
    await this.delay(500);

    const leaveType = getLeaveTypeById(leaveTypeId);
    if (!leaveType) return [];

    const applicableRegs = REGULATIONS.filter((reg) =>
      leaveType.applicableRegulations.includes(reg.regulationNumber)
    );

    return applicableRegs;
  }

  /**
   * Get regulation details with auto-selection
   */
  async getRegulationSummary(
    leaveTypeId: string,
    isMedicalLeave: boolean
  ): Promise<{
    regulations: Regulation[];
    summary: string;
    specialConditions: string[];
    requiredDocuments: string[];
  }> {
    await this.delay(600);

    const regulations = await this.selectApplicableRegulations(leaveTypeId);
    const leaveType = getLeaveTypeById(leaveTypeId);

    if (!leaveType) {
      return {
        regulations: [],
        summary: '',
        specialConditions: [],
        requiredDocuments: [],
      };
    }

    const summaryParts: string[] = [];
    const specialConditions: string[] = [];
    const requiredDocuments: string[] = [...leaveType.requiredDocuments];

    regulations.forEach((reg) => {
      summaryParts.push(`${reg.regulationNumber}: ${reg.summary}`);

      if (reg.specialConditions) {
        specialConditions.push(...reg.specialConditions);
      }

      if (reg.requiredDocuments) {
        requiredDocuments.push(...reg.requiredDocuments);
      }
    });

    if (isMedicalLeave) {
      specialConditions.push('Medical certificate required');
      if (leaveType.fitnessCertificateOnReturn) {
        specialConditions.push('Fitness certificate required upon return');
      }
    }

    return {
      regulations,
      summary: summaryParts.join('\n\n'),
      specialConditions: [...new Set(specialConditions)],
      requiredDocuments: [...new Set(requiredDocuments)],
    };
  }

  /**
   * Helper: Calculate return to duty date
   */
  private calculateReturnDate(toDate: string, toSession: string): string {
    const lastDay = new Date(toDate);

    if (toSession === 'FN') {
      // If leave ends in forenoon, return same day afternoon
      return toDate;
    } else {
      // If leave ends in afternoon, return next day forenoon
      const nextDay = new Date(lastDay);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    }
  }

  /**
   * Complete auto-generation for an application
   */
  async generateAllDocuments(applicationId: string): Promise<{
    internalNote: string;
    draftOrder: string;
    regulations: Regulation[];
    regulationSummary: string;
  }> {
    const application = await leaveService.getApplicationById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const user = getUserById(application.userId);
    const leaveType = getLeaveTypeById(application.leaveTypeId);

    if (!user || !leaveType) {
      throw new Error('User or leave type not found');
    }

    const balance = await leaveService.getLeaveBalance(user.userId, application.leaveTypeId);
    if (!balance) {
      throw new Error('Balance not found');
    }

    const regulations = await this.selectApplicableRegulations(application.leaveTypeId);
    const regSummary = await this.getRegulationSummary(
      application.leaveTypeId,
      application.isMedicalLeave
    );

    const controllingOfficer = user.controllingOfficer
      ? getUserById(user.controllingOfficer)
      : undefined;

    const [internalNote, draftOrder] = await Promise.all([
      this.generateInternalNote({
        application,
        user,
        leaveType,
        balance,
        regulations,
      }),
      this.generateDraftSanctionOrder({
        application,
        user,
        leaveType,
        balance,
        regulations,
        controllingOfficer,
      }),
    ]);

    return {
      internalNote,
      draftOrder,
      regulations,
      regulationSummary: regSummary.summary,
    };
  }
}

export const autoGenerationService = new AutoGenerationService();

// Export individual functions for convenience
export const generateInternalNote = (params: GenerateNoteParams) =>
  autoGenerationService.generateInternalNote(params);

export async function generateDraftSanctionOrder(params: {
  application: LeaveApplication;
  leaveType: LeaveType;
  employee: User;
  balance: LeaveBalance;
  leaveDays: number;
  sanctioningAuthority: User;
}): Promise<string> {
  const { application, leaveType, employee, balance, leaveDays, sanctioningAuthority } = params;

  // Simple sanction order template
  const order = `ANDHRA PRADESH TRANSMISSION CORPORATION LIMITED
(APTRANSCO)
Corporate Office, Hyderabad

*****

Memo No: APTC/HR/LV/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
Date: ${formatDate(new Date().toISOString())}

SUBJECT: Sanction of ${leaveType.name} to ${employee.name}, ${employee.designation}

*****

REFERENCE:
1. Leave Application No. ${application.applicationNumber} dated ${formatDate(application.submittedDate || new Date().toISOString())}
2. Recommendation from Controlling Officer
3. Verification by HR Department

*****

In accordance with the provisions of APTRANSCO Leave Regulations, sanction is hereby accorded to ${employee.name}, ${employee.designation}, ${employee.department} for availing ${leaveType.name} as follows:

EMPLOYEE DETAILS:
Name: ${employee.name}
Employee ID: ${employee.employeeId}
Designation: ${employee.designation}
Department: ${employee.department}
Office: ${employee.office}

LEAVE PERIOD:
From: ${formatDate(application.fromDate)} (${application.fromSession === 'FN' ? 'Forenoon' : 'Afternoon'})
To: ${formatDate(application.toDate)} (${application.toSession === 'FN' ? 'Forenoon' : 'Afternoon'})
Total Duration: ${leaveDays} days

LEAVE ADDRESS:
${application.leaveAddress}
Contact: ${application.contactNumber || 'N/A'}

LEAVE BALANCE:
Opening Balance: ${balance.openingBalance} days
Credited: ${balance.credited} days
Availed (Before): ${balance.availed} days
Current Application: ${leaveDays} days
Balance After: ${(balance.openingBalance + balance.credited - balance.availed - leaveDays)} days

PAY AND ALLOWANCES:
Pay and allowances admissible during the leave period shall be regulated as per applicable rules.

${employee.gender === 'Male' ? 'He' : 'She'} shall return to duty on ${formatDate(new Date(new Date(application.toDate).getTime() + 24 * 60 * 60 * 1000).toISOString())}.

This order issues with the concurrence of the Finance Department.

Sd/-
${sanctioningAuthority.name}
${sanctioningAuthority.designation}

Copy to:
1. The Accounts Officer - for necessary action
2. ${employee.name}, ${employee.designation} - for information and necessary action
3. The Controlling Officer concerned
4. Personal file of ${employee.name}
5. Office file
6. Guard file`;

  return order;
}

export const generateDocuments = (
  application: LeaveApplication,
  options?: {
    includeInternalNote?: boolean;
    includeDraftOrder?: boolean;
  }
) => autoGenerationService.generateDocuments(application, options);
