import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('validation.validEmail'),
  password: z.string().min(1, 'validation.passwordRequired')
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'validation.nameMin'),
    email: z.string().email('validation.validEmail'),
    password: z.string().min(6, 'validation.passwordMin'),
    confirmPassword: z.string().min(6, 'validation.confirmPasswordRequired')
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.passwordMismatch'
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
