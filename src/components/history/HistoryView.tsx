/**
 * HistoryView Component
 * 
 * Displays paginated table of past calls with:
 * - Filtering by AMD strategy and call status
 * - Pagination controls
 * - CSV export functionality
 * - Real-time status updates
 */

"use client";

import { useEffect, useState } from "react";
import { CallStatus, AMDStrategy } from "@/types/call";
import { AMD_STRATEGIES } from "@/components/dial/DialInterface";

interface Call {
  id: string;
  targetNumber: string;
  amdStrategy: string;
  status: CallStatus;
  twilioCallSid: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HistoryFilters {
  strategy: string | "all";
  status: string | "all";
  page: number;
  pageSize: number;
}

interface HistoryResponse {
  calls: Call[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
}

export function HistoryView() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({
    strategy: "all",
    status: "all",
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /**
   * Fetch calls from API
   */
  const fetchCalls = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        pageSize: filters.pageSize.toString(),
        ...(filters.strategy !== "all" && { strategy: filters.strategy }),
        ...(filters.status !== "all" && { status: filters.status }),
      });

      const response = await fetch(`/api/calls/history?${params}`);
      const data: HistoryResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch call history");
      }

      setCalls(data.calls);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, [filters]);

  /**
   * Export calls to CSV
   */
  const handleExportCSV = () => {
    // Fetch all calls (without pagination)
    const params = new URLSearchParams({
      pageSize: "1000", // Large enough to get all
      ...(filters.strategy !== "all" && { strategy: filters.strategy }),
      ...(filters.status !== "all" && { status: filters.status }),
    });

    fetch(`/api/calls/history?${params}`)
      .then((res) => res.json())
      .then((data: HistoryResponse) => {
        // Create CSV content
        const headers = [
          "ID",
          "Target Number",
          "AMD Strategy",
          "Status",
          "Twilio Call SID",
          "Created At",
          "Updated At",
        ];
        const rows = data.calls.map((call) => [
          call.id,
          call.targetNumber,
          call.amdStrategy,
          call.status,
          call.twilioCallSid || "",
          new Date(call.createdAt).toISOString(),
          new Date(call.updatedAt).toISOString(),
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `call-history-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        setError("Failed to export CSV");
      });
  };

  /**
   * Format phone number for display
   */
  const formatPhoneNumber = (number: string): string => {
    const digits = number.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) {
      return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return number;
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: CallStatus): string => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "VOICEMAIL_DETECTED":
      case "MACHINE_DETECTED":
        return "bg-yellow-100 text-yellow-800";
      case "HUMAN_DETECTED":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
      case "RINGING":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Filters and Export */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Strategy Filter */}
          <div>
            <label
              htmlFor="strategyFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              AMD Strategy
            </label>
            <select
              id="strategyFilter"
              value={filters.strategy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, strategy: e.target.value, page: 1 }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Strategies</option>
            {AMD_STRATEGIES.map((s: typeof AMD_STRATEGIES[number]) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="statusFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="RINGING">Ringing</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="HUMAN_DETECTED">Human Detected</option>
              <option value="VOICEMAIL_DETECTED">Voicemail Detected</option>
              <option value="MACHINE_DETECTED">Machine Detected</option>
              <option value="FAILED">Failed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Export CSV
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading calls...</div>
      )}

      {/* Calls Table */}
      {!loading && calls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No calls found. Initiate a call to see history.
        </div>
      )}

      {!loading && calls.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AMD Strategy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Twilio SID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPhoneNumber(call.targetNumber)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {AMD_STRATEGIES.find((s: typeof AMD_STRATEGIES[number]) => s.value === call.amdStrategy)
                        ?.label || call.amdStrategy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          call.status
                        )}`}
                      >
                        {call.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {call.twilioCallSid ? (
                        <span className="text-xs">{call.twilioCallSid}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(call.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(filters.page - 1) * filters.pageSize + 1} to{" "}
                {Math.min(filters.page * filters.pageSize, total)} of {total}{" "}
                calls
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={filters.page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={filters.page >= totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
