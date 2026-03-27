export function HistorySkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <div className="mb-2 h-9 w-64 animate-pulse rounded bg-gray-800" />
          <div className="h-5 w-96 animate-pulse rounded bg-gray-800" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg border border-gray-700 bg-gray-800/50"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
