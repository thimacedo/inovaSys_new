import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text' }) => {
  const baseClass = "bg-slate-200 animate-pulse relative overflow-hidden";
  const variantClasses = {
    text: "h-4 w-full rounded-md",
    rect: "h-full w-full rounded-xl",
    circle: "h-12 w-12 rounded-full"
  };

  return (
    <div className={`${baseClass} ${variantClasses[variant]} ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
  );
};

export const ProcessRowSkeleton = () => (
  <div className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white shadow-sm mb-3">
    <div className="flex items-center gap-4 w-full">
      <Skeleton variant="circle" className="shrink-0 w-10 h-10" />
      <div className="space-y-2 w-1/3">
        <Skeleton className="w-2/3 h-5" />
        <Skeleton className="w-1/2 h-3" />
      </div>
      <div className="space-y-2 w-1/4 hidden md:block">
        <Skeleton className="w-3/4 h-3" />
        <Skeleton className="w-1/2 h-3" />
      </div>
      <div className="flex-1 flex justify-end gap-2">
        <Skeleton className="w-24 h-9 rounded-xl" />
      </div>
    </div>
  </div>
);

export const KanbanSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="space-y-4">
        <Skeleton className="h-8 w-1/2 rounded-lg" />
        <div className="bg-slate-50 p-3 rounded-2xl space-y-4 min-h-[400px]">
          {[1, 2].map(j => (
            <div key={j} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
