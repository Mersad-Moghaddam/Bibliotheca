import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/query/query-keys'
import { fetchAnalytics, fetchInsights, fetchReminder } from '../api/dashboard-api'

export function useDashboardAnalytics() {
  return useQuery({ queryKey: queryKeys.dashboard.analytics, queryFn: fetchAnalytics })
}

export function useDashboardInsights() {
  return useQuery({ queryKey: queryKeys.dashboard.insights, queryFn: fetchInsights })
}

export function useDashboardReminder() {
  return useQuery({ queryKey: queryKeys.dashboard.reminder, queryFn: fetchReminder })
}
