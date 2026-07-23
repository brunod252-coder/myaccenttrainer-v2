export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#f6faf8]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#e9f8f3] border-t-[#20ad68]" />
        <p className="text-sm font-medium text-gray-400">Loading…</p>
      </div>
    </div>
  );
}
