import { z } from 'zod'

export const nameSchema = z.object({
  name: z.string().min(2, 'validation.nameMin')
})

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'validation.currentPasswordRequired'),
  newPassword: z.string().min(6, 'validation.newPasswordMin')
})

export const reminderSchema = z.object({
  enabled: z.boolean(),
  time: z.string().min(1, 'validation.timeRequired'),
  frequency: z.enum(['daily', 'weekdays', 'weekends', 'weekly'])
})

export type NameValues = z.infer<typeof nameSchema>
export type PasswordValues = z.infer<typeof passwordSchema>
export type ReminderValues = z.infer<typeof reminderSchema>
