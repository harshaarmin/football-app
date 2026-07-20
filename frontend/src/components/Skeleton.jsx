export function SkeletonBlock({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-white/10 bg-white/[0.045] ${className}`} />
  );
}

export function PageSkeleton({ label = "Loading football data" }) {
  return (
    <main className="min-h-screen bg-[#06070a] px-4 py-8 text-white lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <SkeletonBlock className="h-8 w-44 rounded-full" />
          <SkeletonBlock className="mt-5 h-16 max-w-xl" />
          <p className="mt-4 text-sm font-bold text-white/35">{label}</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-12">
          <SkeletonBlock className="h-[380px] lg:col-span-8" />
          <SkeletonBlock className="h-[380px] lg:col-span-4" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-40" />
        </div>
      </div>
    </main>
  );
}
