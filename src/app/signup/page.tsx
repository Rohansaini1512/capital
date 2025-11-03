import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { SignUpForm } from "@/components/auth/SignUpForm";
import Link from "next/link";

export default async function SignUpPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Sign Up
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create a new account
        </p>
        <SignUpForm />
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
