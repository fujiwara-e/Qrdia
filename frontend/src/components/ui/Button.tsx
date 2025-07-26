import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    ...props
}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    };

    const sizes = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
    };

    return (
        <button
            className={cn(
                baseClasses,
                variants[variant],
                sizes[size],
                loading && 'cursor-wait',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}
interface ArrowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    className?: string;
    loading?: boolean;
}

export function ArrowButton({ children, className, ...props }: ArrowButtonProps) {
    return (
        <button
            className={cn(
                "group flex items-center space-x-2 text-black font-semibold text-lg transition-colors duration-300 hover:text-gray-400",
                className
            )}
            {...props}
        >
            <span style={{ fontFamily: "'Michroma', sans-serif" }}>{children}</span>
            <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
    );
}