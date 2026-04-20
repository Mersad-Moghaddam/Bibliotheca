import { z } from 'zod'

import { isValidMobile, normalizeMobile } from '../mobile'

const mobileField = z
  .string()
  .trim()
  .min(1, 'validation.mobileRequired')
  .refine((value) => isValidMobile(value), 'validation.validMobile')
  .transform((value) => normalizeMobile(value))

export const loginSchema = z.object({
  mobile: mobileField,
  password: z.string().min(1, 'validation.passwordRequired')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'validation.nameMin'),
  mobile: mobileField,
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, 'validation.validEmail'),
  password: z.string().min(8, 'validation.passwordMin')
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
