"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase-browser";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else {
          setMessage(
            "Account created! Check your email for a confirmation link, or sign in directly."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          window.location.href = "/";
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // ── Logged-in view ──
  if (user) {
    const displayName =
      user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const provider = user.app_metadata?.provider || "email";

    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
          Your Account
        </h1>

        <Card>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-[#11881b] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {displayName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Signed in with {provider === "google" ? "Google" : "Email"}
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/history"
                className="block w-full text-center bg-gray-100 text-[#303030] px-4 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                View Identification History
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-[#1279be] hover:text-[#0e6199] transition text-sm font-medium py-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Logged-out view: Sign In / Sign Up ──
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
        {mode === "signin" ? "Sign In" : "Create Account"}
      </h1>

      <Card>
        <div className="py-2">
          {/* Tab toggle */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => {
                setMode("signin");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 pb-2 text-sm font-medium transition ${
                mode === "signin"
                  ? "text-[#1279be] border-b-2 border-[#1279be]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 pb-2 text-sm font-medium transition ${
                mode === "signup"
                  ? "text-[#1279be] border-b-2 border-[#1279be]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error / success messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* Email/password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1279be] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1279be] focus:border-transparent"
                placeholder="At least 6 characters"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">or</span>
            </div>
          </div>

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-gray-400 text-center mt-6">
            By signing in, you agree to our terms of service.
          </p>
        </div>
      </Card>
    </div>
  );
}
