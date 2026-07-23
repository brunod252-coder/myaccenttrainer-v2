import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6faf8] px-6 text-center">
      <p className="font-display text-7xl text-[#20ad68]">404</p>
      <h1 className="mt-4 font-display text-2xl text-[#17223b]">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]"
      >
        Back to home
      </Link>
    </div>
  );
}
