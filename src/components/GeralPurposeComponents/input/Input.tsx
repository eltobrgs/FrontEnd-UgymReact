import { InputHTMLAttributes, FC, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: FC<InputProps> = ({
  className,
  label,
  error,
  icon,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const baseInputStyles = 'w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200';
  const errorStyles = error ? 'border-red-500' : 'border-gray-300';
  const iconStyles = icon ? 'pl-10' : '';

  const inputClasses = twMerge(
    baseInputStyles,
    errorStyles,
    iconStyles,
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-700 text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={inputClasses}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input; 