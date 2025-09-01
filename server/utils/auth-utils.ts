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
