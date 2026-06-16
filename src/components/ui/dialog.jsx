import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div
                className="absolute inset-0"
                onClick={() => onOpenChange(false)}
            />
            <div className={cn("relative z-50 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6", className)}>
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
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
