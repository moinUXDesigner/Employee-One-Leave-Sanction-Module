import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import type { Session } from '../types';

/**
 * Calculate number of days between two dates including sessions
 */
export function calculateLeaveDays(
  fromDate: string,
  fromSession: Session,
  toDate: string,
  toSession: Session
): number {
  if (!fromDate || !toDate) return 0;

  const start = parseISO(fromDate);
  const end = parseISO(toDate);

  let days = differenceInDays(end, start) + 1;

  // Adjust for sessions
  if (fromSession === 'AN') {
    days -= 0.5;
  }
  if (toSession === 'FN') {
    days -= 0.5;
  }

  return Math.max(0, days);
}

/**
 * Calculate total days including prefix and suffix
 */
export function calculateTotalDays(
  prefixDays: number = 0,
  leaveDays: number = 0,
  suffixDays: number = 0
): number {
  return prefixDays + leaveDays + suffixDays;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format session display
 */
export function formatSession(session: Session): string {
  return session === 'FN' ? 'Forenoon' : 'Afternoon';
}

/**
 * Calculate return to duty date
 */
export function calculateReturnDate(
  toDate: string,
  toSession: Session
): string {
  if (!toDate) return '';

  const lastDay = parseISO(toDate);

  if (toSession === 'FN') {
    // If leave ends in forenoon, return same day afternoon
    return format(lastDay, 'yyyy-MM-dd');
  } else {
    // If leave ends in afternoon, return next day forenoon
    return format(addDays(lastDay, 1), 'yyyy-MM-dd');
  }
}

/**
 * Check if dates are valid (from date not after to date)
 */
export function areDatesValid(fromDate: string, toDate: string): boolean {
  if (!fromDate || !toDate) return false;

  const start = parseISO(fromDate);
  const end = parseISO(toDate);

  return start <= end;
}

/**
 * Get date validation error message
 */
export function getDateValidationError(
  fromDate: string,
  toDate: string
): string | null {
  if (!fromDate) return 'Please select from date';
  if (!toDate) return 'Please select to date';

  if (!areDatesValid(fromDate, toDate)) {
    return 'To date must be after from date';
  }

  return null;
}

/**
 * Format days display (handle half days)
 */
export function formatDaysDisplay(days: number): string {
  if (days === 0) return '0 days';
  if (days === 1) return '1 day';
  if (days % 1 === 0) return `${days} days`;
  return `${days} days`;
}

/**
 * Check if date is in the past
 */
export function isDateInPast(date: string): boolean {
  if (!date) return false;

  const selectedDate = parseISO(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate < today;
}

/**
 * Check if sufficient notice period is given
 */
export function checkNoticePeriod(
  fromDate: string,
  minDaysNotice: number
): { isValid: boolean; daysGiven: number } {
  if (!fromDate) return { isValid: false, daysGiven: 0 };

  const leaveStart = parseISO(fromDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysGiven = differenceInDays(leaveStart, today);

  return {
    isValid: daysGiven >= minDaysNotice,
    daysGiven,
  };
}
