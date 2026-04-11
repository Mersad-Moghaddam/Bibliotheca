import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
  return useMutation({ mutationFn: updateProfileName })
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.reminder })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.reminder })
    }
  })
}
