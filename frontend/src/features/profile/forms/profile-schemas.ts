import { z } from 'zod'

export const nameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters')
})

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
})

export const reminderSchema = z.object({
  enabled: z.boolean(),
  time: z.string().min(1, 'Time is required'),
  frequency: z.enum(['daily', 'weekdays', 'weekends'])
})

export type NameValues = z.infer<typeof nameSchema>
export type PasswordValues = z.infer<typeof passwordSchema>
export type ReminderValues = z.infer<typeof reminderSchema>
