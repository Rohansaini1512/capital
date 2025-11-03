/**
 * Landing Page
 * 
 * Entry point of the application. Redirects authenticated users to dashboard,
 * or shows login/signup options for unauthenticated users.
 */

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession();

  // If authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  // Show landing page with login/signup options
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Capital Telephony AMD
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Automated voicemail detection for outbound calls
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-md hover:bg-gray-300 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
