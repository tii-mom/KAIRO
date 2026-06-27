import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, type LucideIcon } from 'lucide-react';

export type Tone = 'gold' | 'sky' | 'emerald' | 'rose' | 'slate' | 'red';

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function toneClass(tone: Tone) {
  switch (tone) {
    case 'sky':
      return 'text-[#ffddb8] border-[#ffddb8]/20 bg-[#ffddb8]/5';
    case 'emerald':
      return 'text-[#4ade80] border-[#4ade80]/20 bg-[#4ade80]/5';
    case 'rose':
      return 'text-[#ffdad6] border-[#ffdad6]/20 bg-[#ffdad6]/5';
    case 'red':
      return 'text-[#EE1C25] border-[#EE1C25]/20 bg-[#EE1C25]/5';
    case 'slate':
      return 'text-[#c4c7c7] border-white/5 bg-white/[0.02]';
    case 'gold':
    default:
      return 'text-[#ffb95f] border-[#ffb95f]/20 bg-[#ffb95f]/5';
  }
}

export function SignalTicker({
  items,
}: {
  items: Array<{ label: string; value?: string; tone?: Tone }>;
}) {
  const duplicated = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-[#0c0e14]/90 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0c0e14] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0c0e14] to-transparent z-10" />
      <div className="kairo-marquee-track">
        {duplicated.map((item, index) => (
          <div
            key={`${item.label}-${item.value ?? 'signal'}-${index}`}
            className={cx('kairo-chip shrink-0 text-[11px]', toneClass(item.tone ?? 'gold'))}
          >
            <span className="opacity-70 font-mono text-[10px] uppercase tracking-wider">{item.label}:</span>
            {item.value ? <span className="text-white font-mono font-medium">{item.value}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActionLink({
  to,
  children,
  className,
  tone = 'primary',
}: {
  to: string;
  children: ReactNode;
  className?: string;
  tone?: 'primary' | 'secondary' | 'ignite';
}) {
  let buttonStyle = 'btn-primary px-5 py-2.5';
  if (tone === 'secondary') {
    buttonStyle = 'btn-ghost px-5 py-2.5';
  } else if (tone === 'ignite') {
    buttonStyle = 'btn-ignite px-5 py-2.5';
  }

  return (
    <Link className={cx(buttonStyle, className)} to={to}>
      <span>{children}</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export function ActionButton({
  children,
  className,
  tone = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary' | 'ignite';
}) {
  let buttonStyle = 'btn-primary px-5 py-2.5';
  if (tone === 'secondary') {
    buttonStyle = 'btn-ghost px-5 py-2.5';
  } else if (tone === 'ignite') {
    buttonStyle = 'btn-ignite px-5 py-2.5';
  }

  return (
    <button className={cx(buttonStyle, className)} {...props}>
      {children}
    </button>
  );
}

export function MiniStat({
  label,
  value,
  detail,
  tone = 'gold',
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: Tone;
} & { key?: any }) {
  return (
    <div className="glass-panel p-5">
      <div className={cx('inline-flex rounded border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider', toneClass(tone))}>
        {label}
      </div>
      <div className="mt-4 font-sans text-3xl font-bold tracking-tight text-white">{value}</div>
      {detail ? <div className="mt-2 text-xs leading-5 text-white/50">{detail}</div> : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  stats,
  aside,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  stats?: Array<{ label: string; value: ReactNode; detail?: ReactNode; tone?: Tone }>;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('glass-panel p-6 sm:p-8 xl:p-10 relative overflow-hidden', className)}>
      <div className="absolute inset-0 bg-[#ffb95f]/5 blur-[80px] pointer-events-none" />
      <div className="relative grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col justify-center">
          <div className="kairo-eyebrow text-xs tracking-[0.2em]">{eyebrow}</div>
          <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl xl:text-5xl leading-tight">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8">{description}</p>
          {actions ? <div className="mt-8 flex flex-wrap gap-4">{actions}</div> : null}
          {stats?.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map((stat) => (
                <MiniStat key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} tone={stat.tone} />
              ))}
            </div>
          ) : null}
        </div>
        {aside ? <div className="grid gap-4 xl:content-start">{aside}</div> : null}
      </div>
    </section>
  );
}

export function Panel({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  tone = 'default',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <section className={cx('glass-panel p-5 sm:p-6', tone === 'accent' && 'border-[#ffb95f]/20 bg-[#0c0e14]/90', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <div className="kairo-eyebrow text-[10px] tracking-widest">{eyebrow}</div> : null}
          <div className="mt-1 flex items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 text-[#ffb95f]" /> : null}
            <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
          </div>
          {description ? <p className="mt-2 max-w-3xl text-xs leading-5 text-white/50">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function DataRow({
  title,
  subtitle,
  value,
  badge,
  meta,
  trailing,
  to,
  onClick,
  rank,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  to?: string;
  onClick?: () => void;
  rank?: ReactNode;
  className?: string;
} & { key?: any }) {
  const rowContent = (
    <>
      <div className="flex min-w-0 items-start gap-3">
        {rank !== undefined ? (
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-white/10 bg-white/[0.02] font-mono text-xs font-semibold text-white/70">
            {rank}
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold tracking-tight text-white">{title}</div>
            {badge ? <div className="shrink-0">{badge}</div> : null}
          </div>
          {subtitle ? <div className="mt-1 text-xs leading-5 text-white/50">{subtitle}</div> : null}
          {meta ? <div className="mt-2 text-[10px] uppercase font-mono tracking-wider text-white/40">{meta}</div> : null}
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {value ? <div className="font-mono text-right text-sm font-semibold text-[#ffb95f]">{value}</div> : null}
        {trailing ? (
          trailing
        ) : to || onClick ? (
          <ChevronRight className="h-4 w-4 text-white/20" />
        ) : null}
      </div>
    </>
  );

  const rowClassName = cx('glass-panel glass-panel-hover flex justify-between items-center p-4 hover:border-[#ffb95f]/30', className);

  if (to) {
    return (
      <Link className={rowClassName} to={to}>
        {rowContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button className={rowClassName} onClick={onClick} type="button">
        {rowContent}
      </button>
    );
  }

  return <div className={rowClassName}>{rowContent}</div>;
}

export function StatusChip({
  children,
  tone = 'gold',
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return <span className={cx('kairo-chip text-[10px] py-0.5 px-2 font-mono font-semibold uppercase', toneClass(tone))}>{children}</span>;
}

export function EmptyPanel({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass-panel border-dashed border-white/10 bg-white/[0.01] px-5 py-8 text-center rounded">
      <div className="text-sm font-semibold text-white/80">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/40">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function MomentumBar({
  percentage,
  className,
}: {
  percentage: number;
  className?: string;
}) {
  const cappedPercentage = Math.max(0, Math.min(100, percentage));
  return (
    <div className={cx('momentum-bar', className)}>
      <div className="momentum-fill" style={{ width: `${cappedPercentage}%` }} />
    </div>
  );
}

export function FormField({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/40">{label}</label>
      <input className="kairo-form-field" {...props} />
      {error ? <div className="text-[11px] font-mono text-[#EE1C25]">{error}</div> : null}
    </div>
  );
}

export function FormTextArea({
  label,
  error,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/40">{label}</label>
      <textarea className="kairo-form-field min-h-[100px] resize-y" rows={rows} {...props} />
      {error ? <div className="text-[11px] font-mono text-[#EE1C25]">{error}</div> : null}
    </div>
  );
}
