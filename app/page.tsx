import Button from "@/components/Button";
import Card from "@/components/Card";

export default function HomePage() {
  return (
    <div>
      {/* Hero section with green gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50/80 to-white">
        {/* Line-art flower — bottom left */}
        <svg
          className="absolute left-8 bottom-6 w-56 h-56 opacity-[0.07] hidden md:block"
          viewBox="0 0 100 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem */}
          <path d="M50 130 C50 110 48 90 50 70" stroke="#0a6b14" strokeWidth="1.5" />
          {/* Leaves on stem */}
          <path d="M50 100 C40 90 30 88 25 92 C30 96 40 98 50 100Z" fill="#0a6b14" opacity="0.6" />
          <path d="M50 85 C60 75 70 73 75 77 C70 81 60 83 50 85Z" fill="#0a6b14" opacity="0.6" />
          {/* Flower petals (line art) */}
          <path d="M50 70 C45 55 35 45 30 48 C28 55 38 65 50 70Z" stroke="#0a6b14" strokeWidth="1.2" fill="none" />
          <path d="M50 70 C55 55 65 45 70 48 C72 55 62 65 50 70Z" stroke="#0a6b14" strokeWidth="1.2" fill="none" />
          <path d="M50 70 C42 58 38 42 42 38 C48 38 52 52 50 70Z" stroke="#0a6b14" strokeWidth="1.2" fill="none" />
          <path d="M50 70 C58 58 62 42 58 38 C52 38 48 52 50 70Z" stroke="#0a6b14" strokeWidth="1.2" fill="none" />
          <path d="M50 70 C50 52 50 38 50 32 C50 38 50 52 50 70Z" stroke="#0a6b14" strokeWidth="1.2" />
          {/* Center dot */}
          <circle cx="50" cy="68" r="3" fill="#0a6b14" opacity="0.5" />
        </svg>

        {/* Small botanical sprig — top right */}
        <svg
          className="absolute right-16 top-6 w-40 h-40 opacity-[0.07] rotate-[10deg] hidden lg:block"
          viewBox="0 0 80 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem */}
          <path d="M40 120 C40 100 38 80 40 40" stroke="#0a6b14" strokeWidth="1.5" />
          {/* Alternating leaves */}
          <path d="M40 95 C30 85 22 82 20 86 C24 92 32 94 40 95Z" fill="#0a6b14" />
          <path d="M40 80 C50 70 58 67 60 71 C56 77 48 79 40 80Z" fill="#0a6b14" />
          <path d="M40 65 C30 55 22 52 20 56 C24 62 32 64 40 65Z" fill="#0a6b14" />
          <path d="M40 50 C50 40 58 37 60 41 C56 47 48 49 40 50Z" fill="#0a6b14" />
          {/* Bud at top */}
          <ellipse cx="40" cy="36" rx="5" ry="8" fill="#0a6b14" opacity="0.7" />
        </svg>

        {/* Line-art leaf sprig — mid right */}
        <svg
          className="absolute right-2 top-1/3 w-44 h-44 opacity-[0.06] rotate-[50deg] hidden lg:block"
          viewBox="0 0 80 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M40 120 C40 100 42 80 40 40" stroke="#0a6b14" strokeWidth="1.5" />
          <path d="M40 100 C50 90 58 87 60 91 C56 97 48 99 40 100Z" fill="#0a6b14" />
          <path d="M40 85 C30 75 22 72 20 76 C24 82 32 84 40 85Z" fill="#0a6b14" />
          <path d="M40 70 C50 60 58 57 60 61 C56 67 48 69 40 70Z" fill="#0a6b14" />
          <path d="M40 55 C30 45 22 42 20 46 C24 52 32 54 40 55Z" fill="#0a6b14" />
          <ellipse cx="40" cy="36" rx="4" ry="7" fill="#0a6b14" opacity="0.7" />
        </svg>

        {/* Content */}
        <div className="relative z-10 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 shadow-sm">
              <span>🌿</span> AI-Powered Plant Identification
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-[#303030] mb-4">
              Welcome to Green Cover Initiative
              <span className="block text-[#0a6b14] text-xl sm:text-2xl font-semibold mt-2">
                Plant Identifier
              </span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              A comprehensive catalog of plants and trees from all over the
              world. Upload a photo to identify any plant instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button href="/identify" variant="green">
                🌱 Identify Plant
              </Button>
              <Button href="/health" variant="gray">
                🩺 Check Plant Health
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px bg-green-200 flex-1 max-w-[60px]" />
          <h2 className="text-2xl font-bold text-[#303030] text-center">
            How It Works
          </h2>
          <div className="h-px bg-green-200 flex-1 max-w-[60px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="font-semibold text-[#303030] mb-1">
                1. Take a Photo
              </h3>
              <p className="text-sm text-gray-500">
                Snap a picture of any plant or upload an existing photo.
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-[#303030] mb-1">
                2. Get Results
              </h3>
              <p className="text-sm text-gray-500">
                AI identifies the plant with care instructions and confidence
                scores.
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-semibold text-[#303030] mb-1">
                3. Grow Greener
              </h3>
              <p className="text-sm text-gray-500">
                Find nearby nurseries and learn how to care for your plants.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Browse on main site CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50/60 to-green-50/30 border-t border-green-200 py-12">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-[#303030] mb-2">
            🌳 Browse Our Plant Catalog
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Explore flowering plants, leafy plants, trees, vegetables, herbs,
            and wild plants on our main site.
          </p>
          <a
            href="https://www.greencoverinitiative.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0a6b14] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#085a10] transition text-sm"
          >
            Visit greencoverinitiative.com &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
