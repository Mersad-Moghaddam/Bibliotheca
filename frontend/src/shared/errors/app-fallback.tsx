import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'

type AppFallbackProps = {
  onRetry: () => void
}

export function AppFallback({ onRetry }: AppFallbackProps) {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="max-w-lg space-y-4 p-6 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-mutedForeground">
            Libro hit an unexpected error. Your data is safe. Please refresh and try again.
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reload app
          </Button>
        </div>
      </Card>
    </div>
  )
}
