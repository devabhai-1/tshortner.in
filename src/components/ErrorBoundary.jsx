import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--bg-main, #0f172a)',
          color: 'var(--text-main, #e2e8f0)',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-soft, #94a3b8)', marginBottom: '1.5rem', maxWidth: '400px' }}>
            Please try refreshing the page. If the problem continues, contact support.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--accent, #22c55e)',
                background: 'var(--accent-soft, rgba(34, 197, 94, 0.2))',
                color: 'var(--accent, #22c55e)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Refresh page
            </button>
            <Link
              to="/dashboard"
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-soft)',
                background: 'var(--bg-soft)',
                color: 'var(--text-main)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
