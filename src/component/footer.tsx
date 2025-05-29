import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-gray-900 to-gray-850 backdrop-blur-md text-center py-5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-gray-300">
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">About Us</h4>
          <p className="text-sm leading-relaxed">
            We connect homeowners with trusted professionals for all home service needs.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/services" className="hover:text-purple-400 transition-colors">
                Services
              </Link>
            </li>
            <li>
              <Link href="/about-us" className="hover:text-purple-400 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-purple-400 transition-colors">
                Contact
              </Link>
            </li>
            <li>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
          <div className="flex justify-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05-.78-.83-1.89-1.35-3.12-1.35-2.36 0-4.28 1.92-4.28 4.28 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.48.75 2.79 1.89 3.56-.69-.02-1.34-.21-1.91-.52v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.73.15-1.12.15-.27 0-.54-.03-.8-.08.54 1.69 2.11 2.92 3.97 2.96-1.46 1.15-3.29 1.83-5.28 1.83-.34 0-.68-.02-1.01-.06 1.87 1.2 4.1 1.9 6.49 1.9 7.79 0 12.06-6.45 12.06-12.06 0-.18 0-.36-.01-.54.83-.6 1.55-1.35 2.12-2.21z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.061 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.061-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.061-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.514.069-2.879.466-3.957 1.543-1.077 1.077-1.474 2.442-1.543 3.957-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.069 1.514.466 2.879 1.543 3.957 1.077 1.077 2.442 1.474 3.957 1.543 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.514-.069 2.879-.466 3.957-1.543 1.077-1.077 1.474-2.442 1.543-3.957.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.069-1.514-.466-2.879-1.543-3.957-1.077-1.077-2.442-1.474-3.957-1.543-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.441s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.441-1.441-1.441z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-300 mt-8">
        © {new Date().getFullYear()} Hanz POGI. All rights reserved.
      </p>
    </footer>
  );
}