import React from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/utils";

const DialogContext = React.createContext({});

export const Dialog = ({ children, open, onOpenChange }) => {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

export const DialogContent = ({ children, className }) => {
    const { open, onOpenChange } = React.useContext(DialogContext);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div
                className="absolute inset-0"
                onClick={() => onOpenChange(false)}
            />
            <div className={cn("relative z-50 w-full bg-white rounded-3xl shadow-2xl shadow-black/20 border border-gray-100 p-6 sm:p-7", className)}>
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#484848] ring-offset-background transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    );
};

export const DialogHeader = ({ className, ...props }) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}
        {...props}
    />
);

export const DialogTitle = ({ className, ...props }) => (
    <h2
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
);
