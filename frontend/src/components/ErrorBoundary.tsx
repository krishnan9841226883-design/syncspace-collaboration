/**
 * SyncSpace — Error Boundary Component
 * Catches unhandled React errors and displays a user-friendly fallback UI.
 * Prevents full application crashes from propagating to the user.
 * 
 * @module ErrorBoundary
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Props for the ErrorBoundary component */
interface ErrorBoundaryProps {
  /** Child components to wrap with error protection */
  readonly children: ReactNode;
  /** Optional custom fallback UI to display on error */
  readonly fallback?: ReactNode;
}

/** Internal state for the ErrorBoundary */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error, if any */
  error: Error | null;
}

/**
 * Error Boundary class component.
 * React requires class components for error boundaries — 
 * this is the only class component in the application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Derive state from caught error.
   * Called during the "render" phase — no side effects allowed.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Log error details for debugging and monitoring.
   * Called during the "commit" phase — side effects are permitted.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[SyncSpace] Unhandled error caught by ErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  /** Reset error state and retry rendering children */
  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Allow custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            padding: '2rem',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '3rem' }} aria-hidden="true">⚠️</div>
          <h2 style={{ margin: 0, color: 'var(--text-primary, #fff)' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary, #aaa)', maxWidth: '400px' }}>
            An unexpected error occurred. Please try again or refresh the page.
          </p>
          {this.state.error && (
            <details style={{ color: 'var(--text-tertiary, #666)', fontSize: '0.75rem', maxWidth: '500px' }}>
              <summary>Error details</summary>
              <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-primary-500, #6366f1)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            aria-label="Retry loading the component"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
