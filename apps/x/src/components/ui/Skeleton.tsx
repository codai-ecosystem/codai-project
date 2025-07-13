'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

function SkeletonText(): React.ReactElement {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function SkeletonCard(): React.ReactElement {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function SkeletonAvatar({
  size = 'h-10 w-10',
}: {
  size?: string;
}): React.ReactElement {
  return <Skeleton className={cn('rounded-full', size)} />;
}

export { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonText };
