
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
);

export const ProcessRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-slate-100">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-8 w-20" />
  </div>
);
