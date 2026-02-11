import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                    {
                        'bg-brand-primary text-white hover:bg-brand-primary/90': variant === 'primary',
                        'bg-brand-secondary text-white hover:bg-brand-secondary/90': variant === 'secondary',
                        'bg-transparent text-brand-primary hover:bg-brand-primary/10': variant === 'ghost',
                        'bg-semantic-error text-white hover:bg-semantic-error/90': variant === 'danger',
                        'h-btn-sm px-3 text-xs': size === 'sm',
                        'h-btn-md px-6 text-sm': size === 'md',
                        'h-btn-lg px-8 text-base': size === 'lg',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
