import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("Unhandled Error Boundary catch:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                    <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 text-[#E1392A] rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-600 text-sm mb-6">
                            An unexpected application error occurred. We have logged the error and are working to resolve it.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                className="bg-[#E1392A] hover:bg-[#a82220] text-white gap-2 font-bold px-5 py-2.5 rounded-xl"
                            >
                                <RefreshCw size={16} /> Reload Page
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="outline"
                                className="gap-2 font-bold px-5 py-2.5 rounded-xl border-gray-200"
                            >
                                <Home size={16} /> Return Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
