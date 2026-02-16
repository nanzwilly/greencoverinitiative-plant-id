import Button from "@/components/Button";
import Card from "@/components/Card";

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <section className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#303030] mb-4">
            Welcome to Green Cover Initiative
            <span className="block text-[#0a6b14] text-xl sm:text-2xl font-semibold mt-2">Plant Identifier</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            A comprehensive catalog of plants and trees from all over the world.
            Upload a photo to identify any plant instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Button href="/identify" variant="green">
              Identify Plant
            </Button>
            <Button href="/health" variant="gray">
              Check Plant Health
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#303030] text-center mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#e8f4fb] rounded-full flex items-center justify-center mx-auto mb-3">
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
              <div className="w-12 h-12 bg-[#fff8e6] rounded-full flex items-center justify-center mx-auto mb-3">
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
              <div className="w-12 h-12 bg-[#e7f5e8] rounded-full flex items-center justify-center mx-auto mb-3">
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
      <section className="bg-[#fff8e6] border-t border-[#ffb302]/20 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-[#303030] mb-2">
            Browse Our Plant Catalog
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Explore flowering plants, leafy plants, trees, vegetables, herbs,
            and wild plants on our main site.
          </p>
          <a
            href="https://www.greencoverinitiative.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#ffb302] text-[#303030] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#e09e00] transition text-sm"
          >
            Visit greencoverinitiative.com &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
