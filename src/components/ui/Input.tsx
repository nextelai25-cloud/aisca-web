import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="type-caption uppercase tracking-wider text-zinc-400 font-medium pl-1">
            {label}
            {props.required && <span className="text-blue-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            className={`w-full min-h-[52px] bg-[#0a0a0a] border border-white/[0.08] rounded-2xl px-5 py-3 text-white type-body-md transition-all duration-300 outline-none placeholder:text-zinc-600 focus:bg-white/[0.03] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] ${
              error ? 'border-red-500/50 focus:border-red-500/80 focus:ring-red-500/10' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] text-red-400 pl-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
