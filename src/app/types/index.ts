// Core Types for APTRANSCO Leave Sanction Module

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserRole =
  | 'Employee'
  | 'ControllingOfficer'
  | 'HR'
  | 'SanctionAuthority'
  | 'Accounts'
  | 'Admin';

export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  userId: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  department: string;
  office: string;
  zone: string;
  headquarters: string;
  gender: Gender;
  dateOfJoining: string;
  dateOfBirth: string;
  role: UserRole;
  controllingOfficer?: string;
  reportingOfficer?: string;
  sanctioningAuthority?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  role: UserRole | null;
  expiresAt: string | null;
}

// ============================================================================
// Leave Types
// ============================================================================

export type LeaveCategory =
  | 'Standard'
  | 'Medical'
  | 'Maternity'
  | 'Paternity'
  | 'Special';

export type PayType = 'FullPay' | 'HalfPay' | 'NoPay';

export interface LeaveType {
  leaveTypeId: string;
  name: string;
  code: string;
  description: string;
  category: LeaveCategory;
  payType: PayType;

  genderRestriction?: Gender;
  cadreRestrictions?: string[];
  minServiceYears?: number;

  maxDaysPerSpell?: number;
  maxDaysPerYear?: number;
  maxSpellsPerYear?: number;
  minDaysNotice?: number;

  requiredDocuments: string[];
  medicalCertificateRequired: boolean;
  fitnessCertificateOnReturn: boolean;

  prefixSuffixAllowed: boolean;

  applicableRegulations: string[];

  noteTemplateId?: string;
  orderTemplateId?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Leave Balance
// ============================================================================

export interface LeaveBalance {
  balanceId: string;
  userId: string;
  leaveTypeId: string;
  year: number;

  openingBalance: number;
  credits: number;
  totalAvailable: number;

  availed: number;
  pending: number;
  balance: number;

  spellsAvailed: number;
  spellsPending: number;
  spellsBalance: number;

  lastUpdated: string;
}

// ============================================================================
// Leave Application
// ============================================================================

export type Session = 'FN' | 'AN';

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'UnderReview'
  | 'Forwarded'
  | 'UnderVerification'
  | 'PendingSanction'
  | 'Sanctioned'
  | 'Rejected'
  | 'Held'
  | 'ReturnedForCorrection'
  | 'Cancelled'
  | 'RejoiningPending'
  | 'Closed';

export type WorkflowStage =
  | 'Employee'
  | 'ControllingOfficer'
  | 'HR'
  | 'SanctionAuthority'
  | 'SAPPosting'
  | 'Accounts'
  | 'RejoiningAcceptance'
  | 'Completed';

export type SAPStatus =
  | 'Pending'
  | 'InProgress'
  | 'Success'
  | 'Failed'
  | 'Retry';

export type RejoiningStatus =
  | 'NotRequired'
  | 'Pending'
  | 'Submitted'
  | 'Accepted'
  | 'Rejected';

export interface LeaveApplication {
  applicationId: string;
  userId: string;
  leaveTypeId: string;

  applicationDate: string;

  prefixFromDate?: string;
  prefixFromSession?: Session;
  prefixToDate?: string;
  prefixToSession?: Session;
  prefixDays?: number;

  leaveFromDate: string;
  leaveFromSession: Session;
  leaveToDate: string;
  leaveToSession: Session;
  leaveDays: number;

  suffixFromDate?: string;
  suffixFromSession?: Session;
  suffixToDate?: string;
  suffixToSession?: Session;
  suffixDays?: number;

  totalDays: number;

  reasonForLeave: string;
  leaveAddress: string;
  contactNumber: string;
  isMedicalLeave: boolean;

  status: ApplicationStatus;
  currentStage: WorkflowStage;

  workflowHistory: WorkflowHistoryItem[];

  attachments: Attachment[];

  balanceAtApplication: number;
  balanceAfterAvailing: number;

  isEligible: boolean;
  ineligibilityReason?: string;
  applicableRegulations: string[];

  internalNoteId?: string;
  draftOrderId?: string;
  finalOrderId?: string;

  sapTransactionId?: string;
  sapPostingStatus?: SAPStatus;
  sapPostedAt?: string;

  joiningReportId?: string;
  rejoiningStatus?: RejoiningStatus;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Workflow History
// ============================================================================

export type WorkflowAction =
  | 'Submitted'
  | 'Reviewed'
  | 'Forwarded'
  | 'Returned'
  | 'Verified'
  | 'NoteGenerated'
  | 'OrderGenerated'
  | 'ForwardedToSA'
  | 'Sanctioned'
  | 'Rejected'
  | 'Held'
  | 'OrderIssued'
  | 'SAPPosted'
  | 'JoiningReportSubmitted'
  | 'JoiningReportAccepted'
  | 'Closed';

export interface WorkflowHistoryItem {
  historyId: string;
  applicationId: string;

  stage: WorkflowStage;
  action: WorkflowAction;
  status: ApplicationStatus;

  actionBy: string;
  actionByName: string;
  actionByRole: UserRole;

  remarks?: string;
  actionDate: string;

  metadata?: Record<string, any>;
}

// ============================================================================
// Documents
// ============================================================================

export type DocumentType =
  | 'ApplicationForm'
  | 'MedicalCertificate'
  | 'FitnessCertificate'
  | 'AdmissionLetter'
  | 'BondDocument'
  | 'SupportingDocument'
  | 'Other';

export interface Attachment {
  attachmentId: string;
  applicationId: string;

  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;

  documentType: DocumentType;

  uploadedBy: string;
  uploadedAt: string;

  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;

  remarks?: string;
}

// ============================================================================
// Internal Note
// ============================================================================

export interface InternalNote {
  noteId: string;
  applicationId: string;

  generatedContent: string;
  finalContent: string;

  generatedBy: string;
  generatedAt: string;

  editedBy?: string;
  editedAt?: string;

  isFinalized: boolean;
  finalizedAt?: string;

  templateId?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Sanction Order
// ============================================================================

export type OrderType = 'Draft' | 'Final';

export interface SanctionOrder {
  orderId: string;
  applicationId: string;

  memoNumber: string;
  issueDate: string;

  generatedContent: string;
  finalContent: string;

  orderType: OrderType;

  generatedBy?: string;
  generatedAt?: string;

  issuedBy?: string;
  issuedAt?: string;

  editedBy?: string;
  editedAt?: string;

  templateId?: string;

  copyTo: string[];

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Joining Report
// ============================================================================

export type JoiningReportStatus = 'Submitted' | 'UnderReview' | 'Accepted' | 'Rejected';

export interface JoiningReport {
  reportId: string;
  applicationId: string;
  userId: string;

  rejoiningDate: string;
  rejoiningSession: Session;

  fitnessCertificateId?: string;

  attachments: Attachment[];

  remarks?: string;

  status: JoiningReportStatus;

  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;

  submittedAt: string;
  acceptedAt?: string;
}

// ============================================================================
// Regulation
// ============================================================================

export interface Amendment {
  amendmentId: string;
  orderNumber: string;
  orderDate: string;
  summary: string;
  changes: string;
}

export interface Regulation {
  regulationId: string;
  regulationNumber: string;
  title: string;
  summary: string;
  fullText: string;

  category: string;
  applicableLeaveTypes: string[];

  specialConditions?: string[];
  requiredDocuments?: string[];

  maxDaysAdmissible?: number;
  sanctioningNotes?: string;

  relatedOrders?: string[];
  amendments?: Amendment[];

  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Delegation Matrix
// ============================================================================

export interface DelegationMatrix {
  delegationId: string;

  sanctioningAuthority: string;
  authorityName: string;
  authorityDesignation: string;

  applicableLeaveTypes: string[];
  applicableOffices?: string[];
  applicableCadres?: string[];

  maxDaysLimit?: number;
  amountLimit?: number;

  conditions?: string[];

  delegationOrderNumber: string;
  delegationOrderDate: string;

  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Notification
// ============================================================================

export type NotificationType =
  | 'ApplicationSubmitted'
  | 'ApplicationForwarded'
  | 'ApplicationReturned'
  | 'ApplicationSanctioned'
  | 'ApplicationRejected'
  | 'SAPPosted'
  | 'JoiningReportPending'
  | 'JoiningReportAccepted'
  | 'DocumentVerification'
  | 'DeadlineReminder';

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================================================
// UI State
// ============================================================================

export interface ToastState {
  id: string;
  title: string;
  description?: string;
  variant: 'default' | 'destructive' | 'success';
}

export interface UIState {
  isLoading: boolean;
  isSidebarOpen: boolean;
  activeModal: string | null;
  activeDrawer: string | null;
  toast: ToastState | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface LeaveApplicationFormData {
  leaveTypeId: string;

  prefixFromDate?: string;
  prefixFromSession?: Session;
  prefixToDate?: string;
  prefixToSession?: Session;

  leaveFromDate: string;
  leaveFromSession: Session;
  leaveToDate: string;
  leaveToSession: Session;

  suffixFromDate?: string;
  suffixFromSession?: Session;
  suffixToDate?: string;
  suffixToSession?: Session;

  reasonForLeave: string;
  leaveAddress: string;
  contactNumber: string;
  isMedicalLeave: boolean;

  attachments: File[];
}

export interface LoginFormData {
  username: string;
  password: string;
  role?: UserRole;
}

export interface JoiningReportFormData {
  applicationId: string;
  rejoiningDate: string;
  rejoiningSession: Session;
  fitnessCertificate?: File;
  remarks?: string;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface DashboardStats {
  pendingCount: number;
  sanctionedCount: number;
  rejectedCount: number;
  totalApplications: number;
}

export interface LeaveBalanceSummary {
  leaveType: string;
  balance: number;
  availed: number;
  total: number;
}
