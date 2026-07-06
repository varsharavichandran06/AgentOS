/**
 * ErrorBoundary.jsx
 * Catches any React render/lifecycle error in the component tree, logs it
 * with the full stack, and shows a readable crash screen instead of blank page.
 */
import React from 'react';
import log from './logger';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    log.error(
      'ErrorBoundary.jsx',
      'componentDidCatch',
      `React tree crashed: ${error.message}`,
      { error, componentStack: info?.componentStack }
    );
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      const { error, info } = this.state;
      return (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#0a0a0f',
          color: '#f87171',
          fontFamily: 'monospace',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem', gap: '1rem'
        }}>
          <div style={{ fontSize: '2rem' }}>💥</div>
          <h1 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>
            AgentOS — Render Error
          </h1>
          <pre style={{
            background: '#1e1e2e', border: '1px solid #3f3f5a',
            borderRadius: '8px', padding: '1rem',
            maxWidth: '90vw', overflowX: 'auto',
            fontSize: '11px', color: '#fca5a5', lineHeight: 1.6
          }}>
            {error?.toString()}
            {'\n\n'}
            {info?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '0.5rem', padding: '0.5rem 1.5rem',
              background: '#4f46e5', color: '#fff',
              border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
