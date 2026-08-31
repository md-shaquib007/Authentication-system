import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
    icon: Icon,
    label,
    id,
    error,
    showPasswordToggle = false,
    type = 'text',
    className = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const inputType = showPasswordToggle
        ? showPassword
            ? 'text'
            : 'password'
        : type;

    return (
        <div className={`relative mb-6 ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-300 mb-2"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon className="size-5 text-green-500" aria-hidden="true" />
                </div>
                <input
                    {...props}
                    id={inputId}
                    type={inputType}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    className={`w-full pl-10 ${showPasswordToggle ? 'pr-10' : 'pr-3'} py-2 bg-gray-800 bg-opacity-50 rounded-lg border ${
                        error ? 'border-red-500' : 'border-gray-700'
                    } focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200`}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="size-5" />
                        ) : (
                            <Eye className="size-5" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p
                    id={`${inputId}-error`}
                    className="mt-1 text-sm text-red-400"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
