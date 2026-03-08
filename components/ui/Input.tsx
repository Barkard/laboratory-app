import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    multiline?: boolean;
    rows?: number;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    multiline,
    rows,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const commonClasses = `
        block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm transition-all duration-300
        focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white
        disabled:bg-gray-100 disabled:text-slate-400
        ${leftIcon ? 'pl-10' : 'pl-4'}
        ${rightIcon ? 'pr-10' : 'pr-4'}
        ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : 'border-gray-200'}
        py-2.5 text-slate-700 border outline-none placeholder:text-slate-400
        ${className}
    `.trim();

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium mb-1.5 ml-0.5 text-slate-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        {leftIcon}
                    </div>
                )}

                {multiline ? (
                    <textarea
                        id={inputId}
                        rows={rows}
                        className={commonClasses}
                        {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
                    />
                ) : (
                    <input
                        id={inputId}
                        className={commonClasses}
                        {...props as React.InputHTMLAttributes<HTMLInputElement>}
                    />
                )}

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
