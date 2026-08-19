import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Globe,
} from "lucide-react";

const XIcon = ({ size = 18 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
XIcon.displayName = "XIcon";

export default function Footer() {
  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://www.facebook.com/people/Nextkinlife-LLC/61577029054815/?mibextid=wwXIfr&rdid=pk37kk7FzbBW2j1M&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1C2FRbhoeA%2F%3Fmibextid%3DwwXIfr"
    },
    {
      name: "X (Twitter)",
      icon: XIcon,
      url: "https://x.com/NextKinLife"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/nextkinlife?igsh=MXZqenA5cjdqMGt2bw%3D%3D"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://www.linkedin.com/company/nextkin/"
    },
    {
      name: "NextKinLife Global",
      icon: Globe,
      url: "https://nextkinlife.com/"
    }
  ];

  return (
    <footer className="border-t border-[#D5CBA8]/30 bg-[#FAF9F6] text-[#00162D] pb-32 lg:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        {/* Top Links Grid */}
        <div className="grid grid-cols-1 gap-10 border-b border-[#D5CBA8]/30 pb-12 sm:grid-cols-2 md:grid-cols-3">
          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#00162D]">
              Support & Community
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/trust"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Trust & Safety Standards
                </Link>
              </li>
              <li>
                <Link
                  to="/community-guidelines"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Contact Support Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting & Services */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#00162D]">
              Hosting & Features
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/accommodations"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Accommodations
                </Link>
              </li>
              <li>
                <Link
                  to="/host"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Become a Stay Host
                </Link>
              </li>
              <li>
                <Link
                  to="/travel"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Travel Partners
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Events & Meetups
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/people"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  People & Experts
                </Link>
              </li>
            </ul>
          </div>

          {/* NextKinLife Info */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#00162D]">
              NextKinLife
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link
                  to="/career"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Expat Careers & Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-[#484848] hover:text-[#CB2A26] hover:underline transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 pt-6 text-xs sm:text-sm text-[#484848] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} NextKinLife LLC. All rights reserved.</span>
            <span>·</span>
            <Link to="/privacy" className="hover:text-[#CB2A26] hover:underline">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-[#CB2A26] hover:underline">
              Terms
            </Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-[#CB2A26] hover:underline">
              Help & Support
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1.5 font-medium text-[#00162D]">
              <Globe size={16} strokeWidth={1.75} />
              <span>English (US / IN)</span>
            </div>

            <div className="flex items-center gap-3">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`NextKinLife on ${social.name}`}
                  className="w-8 h-8 rounded-full bg-white border border-[#D5CBA8]/40 flex items-center justify-center text-[#00162D] hover:text-[#CB2A26] hover:border-[#CB2A26] transition-colors"
                >
                  <social.icon size={16} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
