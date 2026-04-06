'use client';

import Skeleton from '@/components/shared/Skeleton';

export function ModelCardSkeleton() {
  return (
    <div className="bg-white border border-black/[0.08] p-4 sm:p-6 shadow-card h-[160px] sm:h-[180px] flex flex-col" style={{ borderRadius: 20 }}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width={44} height={44} borderRadius={11} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="0.9rem" />
          <Skeleton width="30%" height="0.7rem" />
        </div>
      </div>
      <div className="space-y-2 flex-1">
        <Skeleton width="100%" height="0.75rem" />
        <Skeleton width="90%" height="0.75rem" />
      </div>
      <div className="pt-4 border-t border-black/[0.08] flex justify-between items-center mt-3">
        <Skeleton width={80} height="0.75rem" />
        <Skeleton width={40} height="0.75rem" />
      </div>
    </div>
  );
}

export function LabTileSkeleton() {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border border-black/[0.08] rounded-lg shadow-card"
      style={{ borderRadius: 12 }}
    >
      <Skeleton width={40} height={40} borderRadius={10} className="flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton width="70%" height="0.85rem" />
        <Skeleton width={45} height="0.65rem" />
      </div>
    </div>
  );
}

export function ChatSidebarModelRowSkeleton() {
  return (
    <div className="w-full flex items-center gap-2 px-2.5 sm:px-3 py-2 mb-0.5" style={{ borderRadius: 8 }}>
      <Skeleton width={30} height={30} borderRadius={7} className="flex-shrink-0" />
      <div className="overflow-hidden min-w-0 flex-1 space-y-1.5">
        <Skeleton width="75%" height="0.78rem" />
        <Skeleton width="50%" height="0.65rem" />
      </div>
    </div>
  );
}

export function ChatActiveModelPanelSkeleton() {
  return (
    <div className="p-4 border-b border-black/[0.08]">
      <Skeleton width={100} height="0.65rem" className="mb-3" />
      <div className="bg-bg border border-black/[0.14] rounded-sm p-3.5 space-y-3" style={{ borderRadius: 12 }}>
        <div className="flex items-center gap-2">
          <Skeleton width={32} height={32} borderRadius={8} />
          <div className="flex-1 space-y-1.5">
            <Skeleton width="65%" height="0.875rem" />
            <Skeleton width="40%" height="0.7rem" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Skeleton width="100%" height="0.75rem" />
          <Skeleton width="92%" height="0.75rem" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <Skeleton width="100%" height={48} borderRadius={6} />
          <Skeleton width="100%" height={48} borderRadius={6} />
          <Skeleton width="100%" height={48} borderRadius={6} />
        </div>
        <div className="flex gap-1.5">
          <Skeleton height={36} borderRadius={8} className="flex-1" />
          <Skeleton height={36} borderRadius={8} className="flex-1" />
        </div>
      </div>
    </div>
  );
}
