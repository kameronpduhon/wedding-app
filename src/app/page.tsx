export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">💒</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Wedding Vendor Coordinator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The easiest way to manage your wedding vendors. 
            Collect invoices, contracts, and coordinate everything in one place.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="font-semibold text-lg mb-2">Send Request Links</h3>
            <p className="text-gray-600 text-sm">
              No vendor accounts needed. Send a link, they upload — done.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">📁</div>
            <h3 className="font-semibold text-lg mb-2">Everything in One Place</h3>
            <p className="text-gray-600 text-sm">
              Invoices, contracts, availability — no more scattered emails.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-semibold text-lg mb-2">Day-Of Coordination</h3>
            <p className="text-gray-600 text-sm">
              Generate a packet with timeline and contacts for all vendors.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="px-8 py-4 bg-pink-500 text-white rounded-xl font-semibold text-lg hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200">
            Get Started — It's Free
          </button>
          <p className="text-gray-500 text-sm mt-3">
            Free for up to 3 vendors. No credit card required.
          </p>
        </div>

        {/* Dev Note - remove in production */}
        <div className="mt-20 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="font-semibold text-yellow-800 mb-2">🛠️ Dev Mode</h3>
          <p className="text-yellow-700 text-sm mb-3">
            To test the vendor response page:
          </p>
          <ol className="text-yellow-700 text-sm list-decimal list-inside space-y-1">
            <li>Add SUPABASE_SERVICE_ROLE_KEY to .env.local</li>
            <li>POST to /api/seed to create test data</li>
            <li>Visit the returned testUrl</li>
          </ol>
          <pre className="mt-3 bg-yellow-100 p-3 rounded text-xs overflow-x-auto">
{`curl -X POST http://localhost:3000/api/seed`}
          </pre>
        </div>
      </div>
    </div>
  )
}
