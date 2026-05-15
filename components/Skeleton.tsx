interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width ?? undefined,
        height: height ?? undefined,
      }}
    />
  );
}

export function KpiSkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="surface p-5 animate-fadeInUp"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <Skeleton width="40%" height={11} />
          <div className="mt-3">
            <Skeleton width="55%" height={28} />
          </div>
          <div className="mt-2">
            <Skeleton width="70%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="surface p-6 animate-fadeIn">
      <Skeleton width="30%" height={14} />
      <div className="mt-4" style={{ height }}>
        <div className="skeleton h-full w-full" />
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 6, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="surface overflow-hidden animate-fadeIn">
      <div className="grid border-b border-border-subtle bg-bg-inset/50 px-5 py-3.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width="60%" height={10} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid border-t border-border-subtle px-5 py-3.5 animate-fadeInUp"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            animationDelay: `${r * 0.04}s`,
          }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} width={c === 0 ? "80%" : "55%"} height={12} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="space-y-3">
          <Skeleton width={140} height={12} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Skeleton width={80} height={10} />
              <div className="mt-2">
                <Skeleton width="100%" height={40} />
              </div>
            </div>
            <div>
              <Skeleton width={80} height={10} />
              <div className="mt-2">
                <Skeleton width="100%" height={40} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
