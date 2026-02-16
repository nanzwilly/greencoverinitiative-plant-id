import type { Metadata } from "next";
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase-server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plant Identifier | Green Cover Initiative",
  description:
    "Identify any plant from a photo. Get care instructions and find nearby nurseries. A project by Green Cover Initiative.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialUser = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    initialUser = user;
  } catch {
    // Supabase not configured yet — that's okay, run without auth
  }

  return (
    <html lang="en">
      <body className="bg-white text-[#303030] min-h-screen flex flex-col antialiased">
        <AuthProvider initialUser={initialUser}>
          <Header />
          <main className="flex-1 bg-white border-t border-gray-200">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-6">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
              <p>
                &copy; {new Date().getFullYear()}{" "}
                <a
                  href="https://www.greencoverinitiative.com"
                  className="text-[#1279be] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Green Cover Initiative
                </a>{" "}
                &ndash; All Rights Reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <a
                  href="https://www.greencoverinitiative.com/about"
                  className="hover:text-[#1279be] transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  About
                </a>
                <a
                  href="https://www.greencoverinitiative.com/contact"
                  className="hover:text-[#1279be] transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact
                </a>
                <a
                  href="https://www.greencoverinitiative.com"
                  className="hover:text-[#1279be] transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Main Site
                </a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
