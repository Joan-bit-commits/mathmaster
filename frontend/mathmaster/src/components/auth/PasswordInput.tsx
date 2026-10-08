import * as React from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Password field with a leading lock icon and a show/hide toggle. Works with react-hook-form's `register`. */
export const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-400" aria-hidden />
        <Input ref={ref} type={visible ? 'text' : 'password'} className={cn('px-10', className)} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-ink-400 transition-colors hover:text-ink-700 dark:hover:text-ink-200"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
