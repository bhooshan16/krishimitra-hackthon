import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '60vh', padding: '40px',
                    textAlign: 'center', fontFamily: 'Inter, sans-serif'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>Something went wrong</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px', maxWidth: '360px' }}>
                        This page ran into an error. Please try refreshing.
                    </p>
                    <button
                        onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                        style={{
                            padding: '12px 28px', background: '#16a34a', color: 'white',
                            border: 'none', borderRadius: '12px', fontSize: '1rem',
                            fontWeight: 700, cursor: 'pointer'
                        }}
                    >
                        🔄 Refresh Page
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre style={{
                            marginTop: '20px', padding: '16px', background: '#fee2e2',
                            borderRadius: '8px', fontSize: '0.75rem', color: '#b91c1c',
                            maxWidth: '500px', overflow: 'auto', textAlign: 'left'
                        }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
