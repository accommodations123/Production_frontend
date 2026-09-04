import React from 'react';
import { Button as CanonicalButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AuthButton({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    className = '',
    disabled = false,
    isLoading = false,
    ...props
}) {
    // Map legacy auth variants to canonical design tokens
    const variantMapping = {
        primary: 'accent',
        secondary: 'secondary',
        outline: 'outline',
        ghost: 'ghost',
        default: 'default',
        accent: 'accent'
    };

    const canonicalVariant = variantMapping[variant] || 'default';

    return (
        <CanonicalButton
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            isLoading={isLoading}
            variant={canonicalVariant}
            className={cn(
                "w-full h-11 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </CanonicalButton>
    );
}

export default AuthButton;
