import type { ReactNode } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-[#07090e] p-4 text-white md:p-8">{children}</main>;
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-10 text-white/60">
      <Loader2 className="h-4 w-4 animate-spin text-[#ffd285]" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <div className="font-bold">API error</div>
          <div className="mt-1 text-sm text-red-100/90">{message}</div>
          {onRetry ? (
            <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200/30 px-4 py-2 text-sm font-bold text-red-50">
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-[#0c0e14]/70 p-8 text-center">
      <div className="text-lg font-black text-white">{title}</div>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/55">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
