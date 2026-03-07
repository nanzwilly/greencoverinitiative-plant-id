export default function ResultNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="text-2xl font-bold text-[#303030] mb-2">
          Result Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          This identification result may have expired or the link is incorrect.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-[#0a6b14] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#085a10] transition text-sm"
        >
          🌿 Identify a Plant
        </a>
      </div>
    </div>
  );
}
