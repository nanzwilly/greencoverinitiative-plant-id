"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase-browser";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo + site name */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.jpg"
            alt="Green Cover Initiative"
            width={44}
            height={34}
            className="rounded-sm"
          />
          <div className="leading-tight">
            <span className="text-lg font-bold text-[#0a6b14]">
              Green Cover Initiative
            </span>
            <span className="block text-[11px] font-medium text-[#303030] tracking-wide -mt-0.5">
              Plant Identifier
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/identify"
            className="text-[#303030] hover:text-[#1279be] transition"
          >
            Identify
          </Link>
          <Link
            href="/health"
            className="text-[#303030] hover:text-[#1279be] transition"
          >
            Plant Health
          </Link>
          <Link
            href="/history"
            className="text-[#303030] hover:text-[#1279be] transition"
          >
            History
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="text-[#303030] hover:text-[#1279be] transition"
              >
                {displayName}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-[#1279be] hover:text-[#0e6199] transition text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/account"
              className="bg-[#1279be] text-white px-4 py-1.5 rounded-md hover:bg-[#0e6199] transition"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#303030]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gray-200 px-4 py-3 flex flex-col gap-3 text-sm font-medium bg-white">
          <Link
            href="/identify"
            className="text-[#303030] hover:text-[#1279be]"
            onClick={() => setMenuOpen(false)}
          >
            Identify
          </Link>
          <Link
            href="/health"
            className="text-[#303030] hover:text-[#1279be]"
            onClick={() => setMenuOpen(false)}
          >
            Plant Health
          </Link>
          <Link
            href="/history"
            className="text-[#303030] hover:text-[#1279be]"
            onClick={() => setMenuOpen(false)}
          >
            History
          </Link>

          {user ? (
            <>
              <Link
                href="/account"
                className="text-[#303030] hover:text-[#1279be]"
                onClick={() => setMenuOpen(false)}
              >
                {displayName}
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleSignOut();
                }}
                className="text-left text-[#1279be] font-semibold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/account"
              className="text-[#1279be] font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
