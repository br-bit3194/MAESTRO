'use client';

import Link from 'next/link';
import { MainNav } from '@/components/nav';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">MAESTRO</span>
          </Link>
          <MainNav />
        </div>
      </div>
    </header>
  );
}
