"use client";
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const nav = [
  { href: '/' as const, label: 'Research' },
  { href: '/bio' as const, label: 'Bio' },
  { href: '/others' as const, label: 'Others' },
];

function HeaderContent() {
  const pathname = usePathname();
  useSearchParams(); // cause client comp re-render on search change for active styles with ?viz

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex items-center justify-between py-6">
          <Link href="/" className="font-ubuntu text-4xl font-normal tracking-tight uppercase">
            Rongbiao (Thomas) Wang
          </Link>
          <nav className="flex items-center gap-6 sm:gap-8">
            {nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-1 py-0.5 font-futura text-xs font-normal uppercase tracking-wider transition-colors ${
                    isActive ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={
      <header className="fixed top-0 left-0 right-0 z-30 bg-white">
        <div className="container-px mx-auto max-w-7xl">
          <div className="flex items-center justify-between py-6">
            <Link href="/" className="font-ubuntu text-4xl font-normal tracking-tight uppercase">
              Rongbiao (Thomas) Wang
            </Link>
            <nav className="flex items-center gap-6 sm:gap-8">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-1 py-0.5 font-futura text-xs font-normal uppercase tracking-wider transition-colors text-gray-500 hover:text-gray-700"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
}


