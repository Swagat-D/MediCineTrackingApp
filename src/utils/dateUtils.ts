/**
 * Date utility functions for formatting timestamps throughout the app
 */

export interface FormattedDate {
  date: string;
  time: string;
  dateTime: string;
  relative: string;
}

/**
 * Format ISO timestamp to user-friendly format
 * @param timestamp ISO timestamp string (e.g., "2025-08-20T06:08:04.581Z")
 * @returns Formatted date object with multiple format options
 */
export const formatTimestamp = (timestamp: string): FormattedDate => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Get local date and time
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }); // e.g., "Aug 20, 2025"
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }); // e.g., "6:08 AM"
  
  const dateTimeStr = `${dateStr} at ${timeStr}`; // e.g., "Aug 20, 2025 at 6:08 AM"
  
  // Calculate relative time
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  let relativeStr: string;
  if (diffMinutes < 1) {
    relativeStr = 'Just now';
  } else if (diffMinutes < 60) {
    relativeStr = `${diffMinutes} min ago`;
  } else if (diffHours < 24) {
    relativeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    relativeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    relativeStr = dateStr;
  }
  
  return {
    date: dateStr,
    time: timeStr,
    dateTime: dateTimeStr,
    relative: relativeStr
  };
};

/**
 * Format timestamp to simple date string
 * @param timestamp ISO timestamp string
 * @returns Simple date string (e.g., "Aug 20, 2025")
 */
export const formatDate = (timestamp: string): string => {
  return formatTimestamp(timestamp).date;
};

/**
 * Format timestamp to simple time string
 * @param timestamp ISO timestamp string
 * @returns Simple time string (e.g., "6:08 AM")
 */
export const formatTime = (timestamp: string): string => {
  return formatTimestamp(timestamp).time;
};

/**
 * Format timestamp to relative time
 * @param timestamp ISO timestamp string
 * @returns Relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp: string): string => {
  return formatTimestamp(timestamp).relative;
};

/**
 * Format timestamp to full date and time
 * @param timestamp ISO timestamp string
 * @returns Full date and time string (e.g., "Aug 20, 2025 at 6:08 AM")
 */
export const formatDateTime = (timestamp: string): string => {
  return formatTimestamp(timestamp).dateTime;
};

/**
 * Check if timestamp is today
 * @param timestamp ISO timestamp string
 * @returns boolean indicating if the timestamp is today
 */
export const isToday = (timestamp: string): boolean => {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if timestamp is yesterday
 * @param timestamp ISO timestamp string
 * @returns boolean indicating if the timestamp is yesterday
 */
export const isYesterday = (timestamp: string): boolean => {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

/**
 * Get time ago string for lists and cards
 * @param timestamp ISO timestamp string
 * @returns Time ago string optimized for UI display
 */
export const getTimeAgo = (timestamp: string): string => {
  const { relative } = formatTimestamp(timestamp);
  
  if (isToday(timestamp)) {
    return `Today, ${formatTime(timestamp)}`;
  } else if (isYesterday(timestamp)) {
    return `Yesterday, ${formatTime(timestamp)}`;
  } else {
    return relative;
  }
};