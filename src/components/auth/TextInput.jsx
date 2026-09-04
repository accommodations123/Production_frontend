import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function TextInput({
    label,
    type = 'text',
    placeholder,
    icon: Icon,
    value,
    onChange,
    className = '',
    rightElement,
    ...props
}) {
    return (
        <div className={cn("flex flex-col space-y-1.5", className)}>
            {label && (
                <label className="text-xs font-bold text-foreground uppercase tracking-wider ml-0.5">
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                {Icon && (
                    <div className="absolute left-3 text-muted-foreground pointer-events-none z-10">
                        <Icon size={18} />
                    </div>
                )}
                <Input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn(
                        "h-11 text-sm bg-background border-border focus-visible:ring-accent",
                        Icon && "pl-10",
                        rightElement && "pr-20"
                    )}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TextInput;
