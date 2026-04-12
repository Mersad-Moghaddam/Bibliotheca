import api from '../../../api/client'
import { extractData } from '../../../api/http'
import { ReadingAnalytics, ReadingGoalsOverview, ReadingSession, ReminderSettings } from '../../../types'

export async function fetchAnalytics() {
  const response = await api.get<ReadingAnalytics>('/dashboard/analytics')
  return extractData(response)
}

export async function fetchReminder() {
  const response = await api.get<ReminderSettings>('/users/reminders')
  return extractData(response)
}

export async function fetchGoals() {
  const response = await api.get<ReadingGoalsOverview>('/reading/goals')
  return extractData(response)
}

export async function updateGoal(payload: {
  weekly?: { pages?: number; books?: number }
  monthly?: { pages?: number; books?: number }
  applySuggestion?: boolean
}) {
  const response = await api.put<ReadingGoalsOverview>('/reading/goals', payload)
  return extractData(response)
}

export async function fetchSessions() {
  const response = await api.get<{ items: ReadingSession[] }>('/reading/sessions')
  return extractData(response).items
}

export async function createSession(payload: { bookId: string; date: string; duration: number; pages: number }) {
  await api.post('/reading/sessions', payload)
}
