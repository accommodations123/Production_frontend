import * as React from "react"
import { cn } from "@/shared/utils/utils"

/**
 * Basic shimmer skeleton primitive
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  )
}

/**
 * Card Loader Skeleton (e.g. for listing cards, events, products)
 */
export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-4 space-y-4 shadow-sm">
          <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </>
  )
}

/**
 * Table Loader Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-8 w-1/6 rounded-xl" />
      </div>
      <div className="divide-y divide-gray-50 px-6 py-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex py-4 items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={cn(
                  "h-5",
                  cIdx === 0 ? "w-1/4 h-8 rounded-lg" : cIdx === cols - 1 ? "w-16 rounded-xl" : "w-1/6"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * List Loader Skeleton
 */
export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * Profile page loading skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 space-y-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
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
  )
}

/**
 * Image Gallery Loader Skeleton
 */
export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-[4/3] md:aspect-[3/1] rounded-3xl overflow-hidden">
      <Skeleton className="md:col-span-2 h-full rounded-none" />
      <div className="hidden md:grid grid-rows-2 gap-2 h-full">
        <Skeleton className="h-full rounded-none" />
        <Skeleton className="h-full rounded-none" />
      </div>
      <div className="hidden md:grid grid-rows-2 gap-2 h-full">
        <Skeleton className="h-full rounded-none" />
        <Skeleton className="h-full rounded-none" />
      </div>
    </div>
  )
}

/**
 * Comprehensive Dashboard Loading Skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-40 sm:h-56 bg-slate-200 animate-pulse relative rounded-b-3xl"></div>
      <div className="container mx-auto px-4 -mt-16 relative z-10 space-y-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <Skeleton className="w-28 h-28 rounded-full border-4 border-white shadow-md shrink-0" />
            <div className="space-y-2.5">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 space-y-6">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
