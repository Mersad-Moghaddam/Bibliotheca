import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { authStore } from '../../../contexts/authStore'
import { analyticsEvents } from '../../../shared/analytics/events'
import { analytics } from '../../../shared/analytics/tracker'
import { queryKeys } from '../../../shared/query/query-keys'
import {
  fetchReminderSettings,
  updatePassword,
  updateProfileName,
  updateReminderSettings
} from '../api/profile-api'

export function useReminderSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.profile.reminder,
    queryFn: fetchReminderSettings
  })
}

export function useUpdateProfileNameMutation() {
  const setUser = authStore((state) => state.setUser)

  return useMutation({
    mutationFn: updateProfileName,
    onSuccess: (_data, name) => {
      const currentUser = authStore.getState().user
      if (!currentUser) return
      setUser({ ...currentUser, name })
    }
  })
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      updatePassword(currentPassword, newPassword)
  })
}

export function useUpdateReminderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateReminderSettings,
    onSuccess: () => {
      analytics.track(analyticsEvents.reminderSettingsChanged)
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.reminder })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.reminder })
    }
  })
}
