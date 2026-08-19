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

        // Auto-recovery for dynamic import / Vite outdated dependency errors
        const isChunkError = 
            error?.message?.includes("Failed to fetch dynamically imported module") ||
            error?.message?.includes("Outdated Optimize Dep") ||
            error?.message?.includes("dynamically imported module") ||
            error?.name === "ChunkLoadError";

        if (isChunkError) {
            try {
                const hasReloaded = sessionStorage.getItem("vite_chunk_reloaded");
                if (!hasReloaded) {
                    sessionStorage.setItem("vite_chunk_reloaded", "true");
                    window.location.reload();
                }
            } catch (e) {
                // Ignore storage errors in Safari Private Browsing mode
                window.location.reload();
            }
        }
    }

    handleReset = () => {
        try {
            sessionStorage.removeItem("vite_chunk_reloaded");
        } catch (e) {
            // Ignore storage errors
        }
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
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
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                className="bg-[#E1392A] hover:bg-[#a82220] text-white gap-2 font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                            >
                                <RefreshCw size={16} /> Reload Page
                            </Button>
                            <Button
                                onClick={() => {
                                    try {
                                        sessionStorage.removeItem("vite_chunk_reloaded");
                                    } catch (e) {}
                                    window.location.href = '/';
                                }}
                                variant="outline"
                                className="gap-2 font-bold px-5 py-2.5 rounded-xl border-gray-200 cursor-pointer"
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
