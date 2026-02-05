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
          <a 
            href="/signup"
            className="inline-block px-8 py-4 bg-pink-500 text-white rounded-xl font-semibold text-lg hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200"
          >
            Get Started — It&apos;s Free
          </a>
          <p className="text-gray-500 text-sm mt-3">
            Free for up to 3 vendors. No credit card required.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Already have an account? <a href="/login" className="text-pink-500 hover:text-pink-600">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}
