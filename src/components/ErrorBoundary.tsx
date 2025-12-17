import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-dark-700">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                                Something went wrong
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                We encountered an unexpected error. Please try reloading the page.
                            </p>
                            {this.state.error && (
                                <details className="text-left mb-6 bg-gray-50 dark:bg-dark-900 p-4 rounded border border-gray-200 dark:border-dark-700">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Error Details
                                    </summary>
                                    <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                                        {this.state.error.message}
                                    </pre>
                                </details>
                            )}
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 font-medium"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
