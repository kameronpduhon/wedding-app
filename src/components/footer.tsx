import { FacebookIcon, InstagramIcon, MailIcon } from './icons'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-gray-400 hover:text-[#5C7C65] transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon size={22} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-[#5C7C65] transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon size={22} />
            </a>
          </div>

          {/* Feedback */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MailIcon size={16} />
            <span>
              Found a bug or have a suggestion?{' '}
              <a
                href="mailto:feedback@weddingvendorhq.com"
                className="text-[#5C7C65] hover:text-[#87A98F] transition-colors"
              >
                Let us know
              </a>
            </span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            © 2026 Wedding Vendor HQ
          </p>
        </div>
      </div>
    </footer>
  )
}
