import api from '../../../api/client'
import { ReadingAnalytics, ReadingInsight, ReminderSettings } from '../../../types'

export async function fetchAnalytics() {
  const response = await api.get<ReadingAnalytics>('/dashboard/analytics')
  return response.data
}

export async function fetchInsights() {
  const response = await api.get<{ items: ReadingInsight[] }>('/dashboard/insights')
  return response.data.items
}

export async function fetchReminder() {
  const response = await api.get<ReminderSettings>('/users/reminders')
  return response.data
}
