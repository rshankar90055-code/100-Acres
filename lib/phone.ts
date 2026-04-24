export function normalizePhoneNumber(rawPhone: string) {
  const trimmed = rawPhone.trim()
  const digitsOnly = trimmed.replace(/[^\d+]/g, '')

  if (!digitsOnly) {
    throw new Error('Enter a mobile number first.')
  }

  if (digitsOnly.startsWith('+')) {
    const normalized = `+${digitsOnly.slice(1).replace(/\D/g, '')}`
    validateE164(normalized)
    return normalized
  }

  const localDigits = digitsOnly.replace(/\D/g, '')

  if (localDigits.length === 10) {
    return `+91${localDigits}`
  }

  if (localDigits.length >= 11 && localDigits.length <= 15) {
    return `+${localDigits}`
  }

  throw new Error('Enter a valid mobile number with country code, or use a 10-digit Indian number.')
}

function validateE164(phone: string) {
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error('Enter a valid mobile number in international format.')
  }
}

export function formatPhoneForDisplay(phone: string) {
  if (phone.startsWith('+91') && phone.length === 13) {
    return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`
  }

  return phone
}
