import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <label className="block">
        {label && (
          <span className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
          {...props}
        />
        {error && (
          <span className="mt-1 block text-sm text-red-600">{error}</span>
        )}
      </label>
    );
  }
);
Input.displayName = "Input";

export { Input };
