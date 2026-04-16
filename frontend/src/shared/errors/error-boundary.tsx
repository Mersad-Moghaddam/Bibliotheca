import { Component, ErrorInfo, ReactNode } from 'react'

import { AppFallback } from './app-fallback'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('app_render_crash', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack
    })
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return <AppFallback onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}
