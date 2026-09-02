import Link from 'next/link';

// Icons matched to the style at https://mateodd25.github.io/ (Font Awesome
// glyphs, currentColor fill, subtle hover scale-up) - just three links to
// the places people actually want to reach me, now that Research/Papers/
// Talks/Academic Activities/bio all live on this single front page.
const socialLinks = [
  {
    label: 'Email',
    href: 'mailto:rbwang@uchicago.edu',
    viewBox: '0 0 512 512',
    path: 'M207.8 20.73c-93.45 18.32-168.7 93.66-187 187.1c-27.64 140.9 68.65 266.2 199.1 285.1c19.01 2.888 36.17-12.26 36.17-31.49l.0001-.6631c0-15.74-11.44-28.88-26.84-31.24c-84.35-12.98-149.2-86.13-149.2-174.2c0-102.9 88.61-185.5 193.4-175.4c91.54 8.869 158.6 91.25 158.6 183.2l0 16.16c0 22.09-17.94 40.05-40 40.05s-40.01-17.96-40.01-40.05v-120.1c0-8.847-7.161-16.02-16.01-16.02l-31.98 .0036c-7.299 0-13.2 4.992-15.12 11.68c-24.85-12.15-54.24-16.38-86.06-5.106c-38.75 13.73-68.12 48.91-73.72 89.64c-9.483 69.01 43.81 128 110.9 128c26.44 0 50.43-9.544 69.59-24.88c24 31.3 65.23 48.69 109.4 37.49C465.2 369.3 496 324.1 495.1 277.2V256.3C495.1 107.1 361.2-9.332 207.8 20.73zM239.1 304.3c-26.47 0-48-21.56-48-48.05s21.53-48.05 48-48.05s48 21.56 48 48.05S266.5 304.3 239.1 304.3z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/rongbiao-wang-a22907239/',
    viewBox: '0 0 448 512',
    path: 'M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z',
  },
  {
    label: 'Google Scholar',
    href: 'https://scholar.google.com/citations?view_op=list_works&hl=en&authuser=1&user=XY2lIekAAAAJ',
    viewBox: '0 0 488 512',
    path: 'M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z',
  },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex items-center justify-between py-6">
          <Link href="/" className="font-ubuntu text-4xl font-normal tracking-tight uppercase">
            Rongbiao (Thomas) Wang
          </Link>
          <nav className="flex items-center gap-5 sm:gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="me noopener noreferrer"
                aria-label={link.label}
                title={link.label}
                className="text-gray-500 transition-transform hover:scale-125 hover:text-black"
              >
                <svg viewBox={link.viewBox} className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d={link.path} />
                </svg>
              </a>
            ))}
          </nav>
        </div>
        <div className="border-b border-gray-400 mx-8 sm:mx-16 md:mx-24" />
      </div>
    </header>
  );
}
