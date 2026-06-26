import { cn } from '../lib/utils';

const buttonVariants = {
  primary:
    'bg-gradient-to-r from-slate-950 via-sky-700 to-cyan-600 text-white shadow-lg shadow-sky-500/25 hover:from-slate-900 hover:via-sky-600 hover:to-cyan-500',
  secondary:
    'border border-sky-200/80 bg-white/90 text-slate-900 hover:border-sky-300 hover:bg-sky-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-sky-50 hover:text-sky-900',
  danger:
    'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-orange-400',
};

const buttonSizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export function Button({ children, label, className, variant = 'primary', size = 'md', type = 'button', ...props }) {
  const content = children ?? label;

  return (
    <button
      type={type}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {content}
    </button>
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'group rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-[0_28px_90px_-55px_rgba(15,23,42,0.7)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-gradient-to-br hover:from-white hover:via-sky-50/60 hover:to-cyan-50/70 hover:shadow-[0_28px_90px_-40px_rgba(14,165,233,0.35)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('border-b border-slate-200/80 px-6 py-5 transition-colors duration-300 group-hover:border-sky-100', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('px-6 py-5 transition-colors duration-300 group-hover:text-slate-950', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('border-t border-slate-200/80 px-6 py-4 transition-colors duration-300 group-hover:border-sky-100', className)} {...props}>
      {children}
    </div>
  );
}

const badgeTones = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  ink: 'bg-slate-950 text-white ring-slate-950',
};

export function Badge({ className, tone = 'slate', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-all duration-200 hover:-translate-y-px hover:shadow-sm',
        badgeTones[tone] || badgeTones.slate,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value = 0, className }) {
  return (
    <div className={cn('h-2 rounded-full bg-slate-100', className)}>
      <div
        className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-amber-400"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function FeatureTile({ title, value, caption, tone = 'sky', className }) {
  const tileTones = {
    sky: 'from-sky-50 via-white to-cyan-50 text-sky-900',
    ink: 'from-slate-950 via-slate-900 to-slate-800 text-white',
    amber: 'from-amber-50 via-white to-orange-50 text-amber-900',
  };

  return (
    <div
      className={cn(
        'rounded-[1.5rem] border border-slate-200 p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)] bg-gradient-to-br transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_22px_60px_-35px_rgba(14,165,233,0.35)]',
        tileTones[tone] || tileTones.sky,
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-70">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {caption ? <p className="mt-2 text-sm leading-6 opacity-80">{caption}</p> : null}
    </div>
  );
}