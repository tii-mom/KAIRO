import type { ReactNode } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { EmptyPanel, Panel } from '../components/runtimeUi';

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="space-y-6 text-white">{children}</main>;
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <Panel title="Loading runtime surface" eyebrow="System" description={label}>
      <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-5 py-5 text-sm text-white/65">
        <Loader2 className="h-4 w-4 animate-spin text-[#ffd285]" />
        {label}
      </div>
    </Panel>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Panel title="Runtime request issue" eyebrow="Error" tone="accent">
      <div className="rounded-[1.35rem] border border-rose-400/18 bg-rose-400/10 p-5 text-rose-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">API error</div>
            <div className="mt-1 text-sm text-rose-100/88">{message}</div>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-200/30 px-4 py-2 text-sm font-semibold text-rose-50"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <EmptyPanel title={title} description={description} action={action} />;
}
