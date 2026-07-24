import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold tracking-tight transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00162D] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:scale-100 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#CB2A26] text-white hover:bg-[#A9221F] shadow-sm hover:shadow',
        primary: 'bg-[#CB2A26] text-white hover:bg-[#A9221F] shadow-sm hover:shadow',
        secondary: 'bg-[#00162D] text-white hover:bg-[#0A1C30] shadow-sm hover:shadow',
        outline: 'border border-slate-200 bg-white text-[#00162D] hover:bg-slate-50 hover:border-slate-300 shadow-xs',
        ghost: 'text-[#00162D] hover:bg-slate-100',
        whatsapp: 'bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-sm',
        linkedin: 'bg-[#0A66C2] text-white hover:bg-[#08529C] shadow-sm',
        link: 'text-[#CB2A26] underline-offset-4 hover:underline p-0 h-auto font-semibold'
      },
      size: {
        default: 'h-10 px-4 py-2 text-xs sm:text-sm',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-sm sm:text-base',
        pill: 'h-11 rounded-full px-6 text-xs sm:text-sm',
        icon: 'h-10 w-10 shrink-0'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export const Button = React.forwardRef(function Button(
  { className, variant, size, asChild = false, isLoading = false, children, disabled, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </Comp>
  );
});

Button.displayName = 'Button';

export { buttonVariants };
