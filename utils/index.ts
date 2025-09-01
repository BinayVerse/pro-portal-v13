// Personal email domains list
export const personalEmailDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'ymail.com',
  'rocketmail.com',
  'protonmail.com',
  'tutanota.com',
  'gmx.com',
  'mail.com',
  'zoho.com',
  'fastmail.com',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'tempmail.org',
];

/**
 * Check if an email address is from a personal email provider
 * @param email - The email address to check
 * @param domains - Array of personal email domains
 * @returns true if the email is from a personal provider
 */
export function isPersonalEmail(email: string, domains: string[]): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailDomain = email.toLowerCase().split('@')[1];
  if (!emailDomain) {
    return false;
  }

  return domains.includes(emailDomain);
}

/**
 * Format date in DD/MM/YYYY HH:MM AM/PM format
 * @param date - Date to format (can be Date object, string, or timestamp)
 * @returns Formatted date string in DD/MM/YYYY HH:MM AM/PM format
 */
export function formatDateTime(date: Date | string | number): string {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  return dateObj.toLocaleString('en-GB', options);
}

/**
 * Format date only in DD/MM/YYYY format
 * @param date - Date to format (can be Date object, string, or timestamp)
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  return dateObj.toLocaleDateString('en-GB', options);
}

/**
 * Format time only in HH:MM AM/PM format
 * @param date - Date to format (can be Date object, string, or timestamp)
 * @returns Formatted time string in HH:MM AM/PM format
 */
export function formatTime(date: Date | string | number): string {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  return dateObj.toLocaleTimeString('en-US', options);
}
