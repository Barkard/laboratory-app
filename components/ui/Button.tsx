import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';
    const widthStyles = fullWidth ? 'w-full' : '';

    const variants = {
        primary: 'bg-linear-to-br from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-0.5',
        secondary: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-sky-200 hover:text-sky-600',
        danger: 'bg-linear-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5',
        outline: 'border-2 border-sky-400 text-sky-600 hover:bg-sky-50 shadow-sm',
        ghost: 'text-slate-500 hover:bg-sky-50 hover:text-sky-600',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg',
    };

    const combinedClasses = `${baseStyles} ${widthStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim();

    return (
        <button
            className={combinedClasses}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <i className='bx bx-loader-alt bx-spin mr-2 text-lg'></i>
            )}
            {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
            <span className="relative z-10">{children}</span>
            {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
        </button>
    );
};

export default Button;
