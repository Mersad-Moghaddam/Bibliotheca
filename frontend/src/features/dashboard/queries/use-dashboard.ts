import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/query/query-keys'
import { createSession, fetchAnalytics, fetchGoals, fetchInsights, fetchReminder, fetchSessions, updateGoal } from '../api/dashboard-api'

export function useDashboardAnalytics() {
  return useQuery({ queryKey: queryKeys.dashboard.analytics, queryFn: fetchAnalytics })
}

export function useDashboardInsights() {
  return useQuery({ queryKey: queryKeys.dashboard.insights, queryFn: fetchInsights })
}

export function useDashboardReminder() {
  return useQuery({ queryKey: queryKeys.dashboard.reminder, queryFn: fetchReminder })
}

export function useGoalProgress() {
  return useQuery({ queryKey: [...queryKeys.dashboard.analytics, 'goals'], queryFn: fetchGoals })
}

export function useSessions() {
  return useQuery({ queryKey: [...queryKeys.dashboard.analytics, 'sessions'], queryFn: fetchSessions })
}

export function useSaveGoalMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateGoal,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.dashboard.analytics, 'goals'] })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.insights })
    }
  })
}

export function useCreateSessionMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.dashboard.analytics, 'sessions'] })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.analytics })
    }
  })
}
