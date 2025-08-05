import Link from 'next/link';

interface FooterProps {
  brandText: string;
  copyrightText: string;
  variant: string;
  sections: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
}

export function Footer({ brandText, copyrightText, variant, sections }: FooterProps) {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🆔</span>
              <span className="text-lg font-bold text-gray-900">{brandText}</span>
            </div>
            <p className="text-gray-600 text-sm">{copyrightText}</p>
          </div>
          
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
