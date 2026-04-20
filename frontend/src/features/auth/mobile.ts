const e164Pattern = /^\+[1-9]\d{9,14}$/

export function normalizeDigits(value: string) {
  return value
    .trim()
    .replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - '۰'.charCodeAt(0)))
    .replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - '٠'.charCodeAt(0)))
}

export function normalizeMobile(value: string) {
  const sanitized = value.trim().replace(/[\s()-]/g, '')
  let digits = normalizeDigits(sanitized).replace(/\D/g, '')

  if (digits.startsWith('0098')) {
    digits = `98${digits.slice(4)}`
  } else if (digits.startsWith('09') && digits.length === 11) {
    digits = `98${digits.slice(1)}`
  } else if (digits.startsWith('9') && digits.length === 10) {
    digits = `98${digits}`
  }

  return `+${digits}`
}

export function isValidMobile(value: string) {
  return e164Pattern.test(normalizeMobile(value))
}
