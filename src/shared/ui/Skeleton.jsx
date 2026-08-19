import * as React from 'react';
import { cn } from '@/shared/utils/utils';

/**
 * Basic shimmer skeleton primitive
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-200/80', className)}
      {...props}
    />
  );
}

/**
 * Card Loader Skeleton (for properties, events, marketplace)
 */
export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <Skeleton className="w-full aspect-[4/3] rounded-xl" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Table Loader Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-8 w-1/6 rounded-xl" />
      </div>
      <div className="divide-y divide-slate-100 px-6 py-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex py-4 items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={cn(
                  'h-5',
                  cIdx === 0 ? 'w-1/4 h-8 rounded-lg' : cIdx === cols - 1 ? 'w-16 rounded-xl' : 'w-1/6'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * List Loader Skeleton
 */
export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Profile page loading skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-8 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
        <Skeleton className="w-24 h-24 rounded-full shrink-0" />
        <div className="space-y-3 flex-1 text-center sm:text-left">
          <Skeleton className="h-8 w-1/3 mx-auto sm:mx-0 rounded-lg" />
          <Skeleton className="h-4 w-1/2 mx-auto sm:mx-0" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
