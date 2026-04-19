import { AlertTriangle, BrainCircuit, Lightbulb, PauseCircle } from 'lucide-react'

import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Skeleton } from '../../../components/ui/skeleton'
import { analyticsEvents } from '../../../shared/analytics/events'
import { analytics } from '../../../shared/analytics/tracker'
import { useI18n } from '../../../shared/i18n/i18n-provider'
import { ReadingInsightModel } from '../insights/insight-engine'

function toneBadgeClass(variant: ReadingInsightModel['variant']) {
  if (variant === 'positive') return 'border-emerald-500/25 bg-emerald-500/10 text-foreground'
  if (variant === 'warning') return 'border-amber-500/25 bg-amber-500/10 text-foreground'
  if (variant === 'inactive') return 'border-slate-500/25 bg-slate-500/10 text-foreground'
  return 'border-primary/20 bg-primary/10 text-foreground'
}

function variantIcon(variant: ReadingInsightModel['variant']) {
  if (variant === 'warning') return <AlertTriangle className="h-4 w-4" />
  if (variant === 'inactive') return <PauseCircle className="h-4 w-4" />
  if (variant === 'positive') return <BrainCircuit className="h-4 w-4" />
  return <Lightbulb className="h-4 w-4" />
}

export function ReadingInsightsCard({
  insight,
  isLoading,
  isError,
  onRetry
}: {
  insight: ReadingInsightModel
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  const { t, locale } = useI18n()
  const formatter = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US')

  if (isLoading || insight.state === 'loading') {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-10/12" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    )
  }

  if (isError || insight.state === 'error') {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="font-medium">{t('dashboard.insights.states.error.title')}</p>
        <p className="mt-1 text-sm text-mutedForeground">{t('dashboard.insights.states.error.description')}</p>
        <Button
          className="mt-3"
          size="sm"
          variant="secondary"
          onClick={() => {
            analytics.track(analyticsEvents.coachInsightInteracted, { action: 'retry' })
            onRetry()
          }}
        >
          {t('dashboard.insights.states.error.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <Badge className={toneBadgeClass(insight.variant)}>
          <span className="mr-1 inline-flex">{variantIcon(insight.variant)}</span>
          {t(`dashboard.insights.variants.${insight.variant}`)}
        </Badge>
        <p className="text-xs text-mutedForeground">{t('dashboard.insights.priorityLabel')}</p>
      </div>
      <div>
        <p className="font-semibold">{t(insight.titleKey)}</p>
        <p className="mt-1 text-sm text-mutedForeground">{t(insight.messageKey)}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {insight.signals.slice(0, 2).map((signal) => (
          <div key={signal.labelKey} className="rounded-lg border border-border/80 bg-background/60 px-3 py-2">
            <p className="text-xs text-mutedForeground">{t(signal.labelKey)}</p>
            <p className="text-sm font-semibold">
              {signal.format === 'percent' ? `${formatter.format(signal.value)}%` : formatter.format(signal.value)}
            </p>
          </div>
        ))}
      </div>

      {insight.recommendationKey ? (
        <div className="rounded-lg border border-dashed border-border px-3 py-2">
          <p className="text-xs text-mutedForeground">{t('dashboard.insights.recommendationLabel')}</p>
          <p className="text-sm font-medium">{t(insight.recommendationKey)}</p>
        </div>
      ) : null}
    </div>
  )
}
