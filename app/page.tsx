import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">Student Gallery</h1>
        <p className="text-xl text-gray-600 mb-8">
          Explore amazing student work with interactive features
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/gallery"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Gallery
          </Link>
          <Link
            href="/examples"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            View Examples
          </Link>
        </div>
      </div>
    </div>
  );
}
