import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Link Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          This request link is invalid or has expired.
        </p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}
