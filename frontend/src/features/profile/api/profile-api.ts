import api from '../../../api/client'
import { extractData } from '../../../api/http'
import { ReminderSettings } from '../../../types'

export async function updateProfileName(name: string) {
  await api.put('/users/profile', { name })
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  await api.put('/users/password', { currentPassword, newPassword })
}

export async function fetchReminderSettings() {
  const response = await api.get<ReminderSettings>('/users/reminders')
  return extractData(response)
}

export async function updateReminderSettings(payload: ReminderSettings) {
  const timezone = payload.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
  await api.put('/users/reminders', { ...payload, timezone })
}
