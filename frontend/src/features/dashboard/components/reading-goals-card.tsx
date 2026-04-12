import { useMemo, useState } from 'react'

import { Progress } from '../../../components/UI'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useI18n } from '../../../shared/i18n/i18n-provider'
import { GoalPeriodOverview, GoalSuggestion, ReadingGoalsOverview } from '../../../types'

type GoalDraft = { pages?: string; books?: string }

function GoalStatusPill({ status }: { status: GoalPeriodOverview['status'] }) {
  const { t } = useI18n()
  return <span className="rounded-full bg-muted px-2 py-1 text-xs text-mutedForeground">{t(`dashboard.goalStatus.${status}`)}</span>
}

function GoalRow({ item }: { item: GoalPeriodOverview }) {
  const { t } = useI18n()
  const pagesTarget = item.targetPages ?? 0
  const booksTarget = item.targetBooks ?? 0
  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <p className="font-medium">{item.period === 'weekly' ? t('dashboard.periodWeekly') : t('dashboard.periodMonthly')}</p>
        <GoalStatusPill status={item.status} />
      </div>
      <p className="text-xs text-mutedForeground">{t('dashboard.goalSummary', { pagesRead: item.pagesRead, pagesGoal: pagesTarget, booksRead: item.booksRead, booksGoal: booksTarget })}</p>
      <Progress value={Math.min(100, item.percent)} />
      <p className="text-xs text-mutedForeground">{t('dashboard.goalPercent', { percent: item.percent })}</p>
    </div>
  )
}

export function ReadingGoalsCard({
  goals,
  isSaving,
  onSave
}: {
  goals?: ReadingGoalsOverview
  isSaving: boolean
  onSave: (payload: { weekly?: { pages?: number; books?: number }; monthly?: { pages?: number; books?: number }; applySuggestion?: boolean }) => Promise<void>
}) {
  const { t } = useI18n()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<{ weekly: GoalDraft; monthly: GoalDraft }>({ weekly: {}, monthly: {} })

  const suggestionByPeriod = useMemo(() => {
    const map: Partial<Record<'weekly' | 'monthly', GoalSuggestion>> = {}
    goals?.suggestions.forEach((s) => {
      map[s.period] = s
    })
    return map
  }, [goals])

  const prefillFromGoals = () => {
    setDraft({
      weekly: {
        pages: goals?.weekly.targetPages?.toString() ?? '',
        books: goals?.weekly.targetBooks?.toString() ?? ''
      },
      monthly: {
        pages: goals?.monthly.targetPages?.toString() ?? '',
        books: goals?.monthly.targetBooks?.toString() ?? ''
      }
    })
  }

  const applySuggestion = (period: 'weekly' | 'monthly') => {
    const suggestion = suggestionByPeriod[period]
    if (!suggestion) return
    setDraft((prev) => ({
      ...prev,
      [period]: {
        pages: suggestion.targetPages?.toString() ?? '',
        books: suggestion.targetBooks?.toString() ?? ''
      }
    }))
    setEditing(true)
  }

  const toNumber = (value?: string) => {
    if (!value || value.trim() === '') return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return (
    <div className="space-y-3">
      {goals ? (
        <>
          <GoalRow item={goals.weekly} />
          <GoalRow item={goals.monthly} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-mutedForeground">{t('dashboard.goalsEmpty')}</div>
      )}

      {goals?.suggestions.length ? (
        <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
          <p className="text-sm font-medium">{t('dashboard.suggestedTitle')}</p>
          {goals.suggestions.map((s) => (
            <div key={s.period} className="flex items-center justify-between gap-3 text-xs text-mutedForeground">
              <div>
                <p className="font-medium text-foreground">{s.period === 'weekly' ? t('dashboard.periodWeekly') : t('dashboard.periodMonthly')}</p>
                <p>{t('dashboard.goalSummary', { pagesRead: 0, pagesGoal: s.targetPages ?? 0, booksRead: 0, booksGoal: s.targetBooks ?? 0 })}</p>
                <p>{s.reasonKey ? t(`dashboard.goalSuggestionReasons.${s.reasonKey}`) : t('dashboard.goalSuggestionReasons.fallback')}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => applySuggestion(s.period)}>{t('dashboard.applySuggestion')}</Button>
            </div>
          ))}
        </div>
      ) : null}

      {editing ? (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-3">
          <p className="text-sm font-medium">{t('dashboard.editGoals')}</p>
          {(['weekly', 'monthly'] as const).map((period) => (
            <div key={period} className="grid grid-cols-2 gap-2">
              <Input placeholder={t('dashboard.pagesGoal')} type="number" min={0} value={draft[period].pages ?? ''} onChange={(e) => setDraft((prev) => ({ ...prev, [period]: { ...prev[period], pages: e.target.value } }))} />
              <Input placeholder={t('dashboard.booksGoal')} type="number" min={0} value={draft[period].books ?? ''} onChange={(e) => setDraft((prev) => ({ ...prev, [period]: { ...prev[period], books: e.target.value } }))} />
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isSaving}
              onClick={async () => {
                await onSave({
                  weekly: { pages: toNumber(draft.weekly.pages), books: toNumber(draft.weekly.books) },
                  monthly: { pages: toNumber(draft.monthly.pages), books: toNumber(draft.monthly.books) }
                })
                setEditing(false)
              }}
            >
              {t('common.save')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => { prefillFromGoals(); setEditing(true) }}>{t('dashboard.editGoal')}</Button>
          <Button size="sm" variant="ghost" disabled={isSaving || !goals?.suggestions.length} onClick={async () => onSave({ applySuggestion: true })}>{t('dashboard.useSuggestions')}</Button>
        </div>
      )}
    </div>
  )
}
