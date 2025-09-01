// Display value mappings for email templates

export const companySizeLabels: Record<string, string> = {
  '1-10': '1-10 employees',
  '11-50': '11-50 employees',
  '51-200': '51-200 employees',
  '201-1000': '201-1000 employees',
  '1000+': '1000+ employees'
}

export const requestForLabels: Record<string, string> = {
  'legal': 'Legal artefact analysis',
  'hr': 'HR documentation',
  'finance': 'Financial artefacts',
  'research': 'Research and analysis',
  'customer-support': 'Customer support',
  'other': 'Other'
}

export function getDisplayValue(value: string, mapping: Record<string, string>): string {
  return mapping[value] || value
}

export function getCompanySizeLabel(value: string): string {
  return getDisplayValue(value, companySizeLabels)
}

export function getRequestForLabel(value: string): string {
  return getDisplayValue(value, requestForLabels)
}
