import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-sm p-card-padding',
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';

export { Card };
