import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Accessible Skeleton Primitive
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`bg-surface-alt/80 border border-border/40 rounded-md animate-shimmer ${className}`}
      {...props}
    />
  );
}

/**
 * KPI Card Skeleton matching exact dimensions of Dashboard Ribbon and KPICard
 */
export function KPISkeleton({
  className = '',
  accent = 'border-border/40',
}: {
  className?: string;
  accent?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading metric"
      className={`bg-surface-alt p-6 flex flex-col justify-between border-2 ${accent} rounded-xl shadow-sm min-h-[160px] animate-shimmer relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-sm" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="my-2">
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="mt-4 border-t border-border/40 pt-3 flex justify-between items-center">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <span className="sr-only">Loading metric data...</span>
    </div>
  );
}

/**
 * Chart Skeleton Container matching dimensions of Recharts containers
 */
export function ChartSkeleton({
  title,
  height = 'h-[360px]',
  className = '',
}: {
  title?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={`Loading ${title || 'chart'}`}
      className={`border border-border/80 bg-surface rounded-xl flex flex-col shadow-sm overflow-hidden ${className}`}
    >
      <div className="border-b border-border/60 p-4 flex justify-between items-center bg-surface-alt/50">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-sm" />
          {title ? (
            <span className="font-mono text-xs font-bold text-text-muted uppercase tracking-widest">
              {title}
            </span>
          ) : (
            <Skeleton className="h-3 w-40" />
          )}
        </div>
        <Skeleton className="h-3 w-16" />
      </div>

      <div className={`p-6 flex flex-col justify-between ${height} animate-shimmer relative`}>
        {/* Simulated Cartesian chart grid lines */}
        <div className="flex-1 flex flex-col justify-between w-full opacity-30 pointer-events-none py-4">
          <div className="border-b border-border/60 w-full"></div>
          <div className="border-b border-border/60 w-full"></div>
          <div className="border-b border-border/60 w-full"></div>
          <div className="border-b border-border/60 w-full"></div>
        </div>

        {/* Simulated Axis line */}
        <div className="border-t border-border/80 pt-2 flex justify-between">
          <Skeleton className="h-2 w-8" />
          <Skeleton className="h-2 w-8" />
          <Skeleton className="h-2 w-8" />
          <Skeleton className="h-2 w-8" />
          <Skeleton className="h-2 w-8" />
        </div>
      </div>
      <span className="sr-only">Loading chart visualization...</span>
    </div>
  );
}

/**
 * Data Table Skeleton matching table layout
 */
export function TableSkeleton({
  rows = 5,
  columns = 6,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading table data"
      className={`border border-border rounded-xl bg-surface overflow-hidden shadow-sm ${className}`}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-surface-alt border-b border-border">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="bg-surface/50">
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="p-4">
                    <Skeleton
                      className={`h-3 ${
                        c === 0 ? 'w-36' : c % 2 === 0 ? 'w-16 ml-auto' : 'w-24'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="sr-only">Loading table records...</span>
    </div>
  );
}

/**
 * Agent Card Skeleton
 */
export function AgentCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading agent profile"
      className="flex flex-col bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-6 animate-shimmer min-h-[320px] justify-between"
    >
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-4/5" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-8 w-full rounded" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4 mt-6">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
      <span className="sr-only">Loading agent profile...</span>
    </div>
  );
}

/**
 * Non-blocking Background Refresh Status Badge
 */
export function BackgroundRefreshBadge({
  isValidating,
  lastUpdated,
  onRefresh,
}: {
  isValidating: boolean;
  lastUpdated?: number | null;
  onRefresh?: () => void;
}) {
  if (!isValidating && !lastUpdated) return null;

  return (
    <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
      {isValidating ? (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
          <RefreshCw size={10} className="animate-spin" />
          <span>UPDATING</span>
        </span>
      ) : lastUpdated ? (
        <button
          onClick={onRefresh}
          title="Click to refresh data"
          className="inline-flex items-center gap-1 hover:text-brand-primary transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-mint/70 inline-block"></span>
          <span>CACHED {new Date(lastUpdated).toLocaleTimeString()}</span>
        </button>
      ) : null}
    </div>
  );
}

/**
 * Non-blocking Refresh Error Toast/Banner
 */
export function RevalidateErrorBanner({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry?: () => void;
}) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="bg-amber-950/40 border border-amber-600/40 text-amber-200 px-4 py-2.5 rounded-lg flex items-center justify-between text-xs font-mono mb-4 animate-fade-in"
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={14} className="text-amber-400 shrink-0" />
        <span>
          Background sync failed: {error.message}. Displaying cached telemetry.
        </span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 px-2 py-1 bg-amber-900/60 hover:bg-amber-800 border border-amber-600/60 rounded text-[10px] text-amber-100 uppercase tracking-wider transition-colors shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}
