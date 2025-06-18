import { formatDistanceToNow, isValid, parseISO, format } from 'date-fns';

/**
 * Safely formats a timestamp to a relative time string (e.g., "2 hours ago")
 * @param timestamp - The timestamp to format (string, Date, or null/undefined)
 * @param options - Options for formatDistanceToNow
 * @returns Formatted string or fallback message
 */
export const safeFormatDistanceToNow = (
  timestamp: string | Date | null | undefined,
  options: { addSuffix?: boolean } = { addSuffix: true }
): string => {
  if (!timestamp) return 'Unknown time';
  
  try {
    let date: Date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      // Try parsing as ISO string first
      date = parseISO(timestamp);
      
      // If that fails, try creating a new Date
      if (!isValid(date)) {
        date = new Date(timestamp);
      }
    } else {
      return 'Unknown time';
    }
    
    // If still invalid, return fallback
    if (!isValid(date)) {
      return 'Unknown time';
    }
    
    return formatDistanceToNow(date, options);
  } catch (error) {
    console.warn('Invalid timestamp format:', timestamp, error);
    return 'Unknown time';
  }
};

/**
 * Safely formats a timestamp to a specific format (e.g., "MMM dd, yyyy")
 * @param timestamp - The timestamp to format (string, Date, or null/undefined)
 * @param formatString - The format string for date-fns format function
 * @returns Formatted string or fallback message
 */
export const safeFormatDate = (
  timestamp: string | Date | null | undefined,
  formatString: string = 'MMM dd, yyyy'
): string => {
  if (!timestamp) return 'Unknown date';
  
  try {
    let date: Date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      // Try parsing as ISO string first
      date = parseISO(timestamp);
      
      // If that fails, try creating a new Date
      if (!isValid(date)) {
        date = new Date(timestamp);
      }
    } else {
      return 'Unknown date';
    }
    
    // If still invalid, return fallback
    if (!isValid(date)) {
      return 'Unknown date';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.warn('Invalid timestamp format:', timestamp, error);
    return 'Unknown date';
  }
};

/**
 * Validates if a timestamp is valid
 * @param timestamp - The timestamp to validate
 * @returns Boolean indicating if the timestamp is valid
 */
export const isValidTimestamp = (timestamp: string | Date | null | undefined): boolean => {
  if (!timestamp) return false;
  
  try {
    let date: Date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = parseISO(timestamp);
      if (!isValid(date)) {
        date = new Date(timestamp);
      }
    } else {
      return false;
    }
    
    return isValid(date);
  } catch {
    return false;
  }
};
