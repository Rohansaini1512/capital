import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { DialInterface } from "@/components/dial/DialInterface";
import { HistoryView } from "@/components/history/HistoryView";
import { LogoutButton } from "@/components/auth/LogoutButton";

/**
 * Dashboard Page
 * 
 * Main application interface showing:
 * - Dial interface for initiating calls
 * - Call history with filters and export
 * - User profile and logout
 */
export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Capital Telephony AMD
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user.name || user.email}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Dial Interface */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Initiate Call
            </h2>
            <DialInterface />
          </section>

          {/* History View */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Call History
            </h2>
            <HistoryView />
          </section>
        </div>
      </main>
    </div>
  );
}
