import { zodResolver } from '@hookform/resolvers/zod'
import { Flame, Sparkles, Timer } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '../../components/ui/button'
import { SectionCard } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { SectionHeader } from '../../components/ui/section-header'
import { Select } from '../../components/ui/select'
import {
  nameSchema,
  NameValues,
  passwordSchema,
  PasswordValues,
  reminderSchema,
  ReminderValues
} from '../../features/profile/forms/profile-schemas'
import {
  useReminderSettingsQuery,
  useUpdatePasswordMutation,
  useUpdateProfileNameMutation,
  useUpdateReminderMutation
} from '../../features/profile/queries/use-profile'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { useToast } from '../../shared/toast/toast-provider'

import { FieldBlock, FieldError, PageHeading } from './shared/page-primitives'

export function Profile() {
  const { t } = useI18n()
  const toast = useToast()
  const reminderQuery = useReminderSettingsQuery()
  const updateName = useUpdateProfileNameMutation()
  const updatePassword = useUpdatePasswordMutation()
  const updateReminder = useUpdateReminderMutation()

  const nameForm = useForm<NameValues>({ resolver: zodResolver(nameSchema), defaultValues: { name: '' } })
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '' } })
  const reminderForm = useForm<ReminderValues>({ resolver: zodResolver(reminderSchema), values: reminderQuery.data ?? { enabled: false, time: '20:00', frequency: 'daily' } })

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeading title={t('profile.title')} />
      <div className="grid gap-3 xl:grid-cols-2">
        <SectionCard>
          <SectionHeader title={t('profile.updateName')} icon={<Sparkles className="h-4 w-4" />} />
          <form onSubmit={nameForm.handleSubmit(async (values) => { await updateName.mutateAsync(values.name); toast.success(t('profile.nameSuccess')) })} className="space-y-3">
            <FieldBlock label={t('profile.newName')}><Input placeholder={t('profile.newName')} {...nameForm.register('name')} /></FieldBlock>
            <FieldError message={nameForm.formState.errors.name?.message} />
            <Button type="submit" className="w-full sm:w-auto" disabled={updateName.isPending}>{t('profile.updateNameAction')}</Button>
          </form>
        </SectionCard>
        <SectionCard>
          <SectionHeader title={t('profile.updatePassword')} icon={<Timer className="h-4 w-4" />} />
          <form onSubmit={passwordForm.handleSubmit(async (values) => { await updatePassword.mutateAsync(values); toast.success(t('profile.passwordSuccess')); passwordForm.reset() })} className="space-y-3">
            <div><FieldBlock label={t('profile.currentPassword')}><Input type="password" placeholder={t('profile.currentPassword')} {...passwordForm.register('currentPassword')} /></FieldBlock><FieldError message={passwordForm.formState.errors.currentPassword?.message} /></div>
            <div><FieldBlock label={t('profile.newPassword')}><Input type="password" placeholder={t('profile.newPassword')} {...passwordForm.register('newPassword')} /></FieldBlock><FieldError message={passwordForm.formState.errors.newPassword?.message} /></div>
            <Button type="submit" className="w-full sm:w-auto" disabled={updatePassword.isPending}>{t('profile.updatePasswordAction')}</Button>
          </form>
        </SectionCard>
      </div>
      <SectionCard className="max-w-3xl">
        <SectionHeader title={t('profile.reminders')} icon={<Flame className="h-4 w-4" />} />
        <form onSubmit={reminderForm.handleSubmit(async (values) => { await updateReminder.mutateAsync(values); toast.success(t('profile.reminderSuccess')) })} className="grid gap-3 md:grid-cols-3">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm"><input type="checkbox" checked={reminderForm.watch('enabled')} onChange={(e) => reminderForm.setValue('enabled', e.target.checked)} />{t('profile.reminderEnabled')}</label>
          <FieldBlock label={t('profile.reminderTime')}><Input type="time" {...reminderForm.register('time')} /></FieldBlock>
          <FieldBlock label={t('profile.reminderFrequency')}><Select {...reminderForm.register('frequency')}><option value="daily">{t('profile.daily')}</option><option value="weekdays">{t('profile.weekdays')}</option><option value="weekends">{t('profile.weekends')}</option><option value="weekly">{t('profile.weekly')}</option></Select></FieldBlock>
          <Button type="submit" className="w-full md:col-span-3 md:w-fit" disabled={updateReminder.isPending}>{t('profile.saveReminders')}</Button>
        </form>
      </SectionCard>
    </div>
  )
}
