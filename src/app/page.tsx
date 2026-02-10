import { MailIcon, ClipboardIcon, SparklesIcon } from '@/components/icons'
import { LogoIcon } from '@/components/logo'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F0E9] to-white flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <LogoIcon size={80} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E2D] mb-4">
            Wedding Vendor <span className="text-[#87A98F]">HQ</span>
          </h1>
          <p className="text-lg text-[#5C7C65] font-medium mb-2">Plan Your Dream Team</p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The easiest way to manage your wedding vendors. 
            Collect invoices, contracts, and coordinate everything in one place.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#5C7C65] mb-4">
              <MailIcon size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Send Request Links</h3>
            <p className="text-gray-600 text-sm">
              No vendor accounts needed. Send a link, they upload — done.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#5C7C65] mb-4">
              <ClipboardIcon size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Everything in One Place</h3>
            <p className="text-gray-600 text-sm">
              Invoices, contracts, availability — no more scattered emails.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm relative">
            <span className="absolute top-4 right-4 px-2 py-0.5 bg-[#FDF6E3] text-[#96792A] text-xs font-medium rounded-full">
              Coming Soon
            </span>
            <div className="w-12 h-12 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#5C7C65] mb-4">
              <SparklesIcon size={24} />
            </div>
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
            className="inline-block px-8 py-4 bg-[#87A98F] text-white rounded-xl font-semibold text-lg hover:bg-[#5C7C65] transition-colors shadow-lg shadow-[#87A98F]/30"
          >
            Get Started — It&apos;s Free
          </a>
          <p className="text-gray-500 text-sm mt-3">
            Free for up to 3 vendors. No credit card required.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Already have an account? <a href="/login" className="text-[#5C7C65] hover:text-[#87A98F]">Sign in</a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
