/**
 * DialInterface Component
 * 
 * Form interface for initiating outbound calls with:
 * - Target phone number input (US toll-free numbers)
 * - AMD strategy selection dropdown
 * - Dial Now button
 * 
 * Handles form validation and call initiation via API.
 */

"use client";

import { useState } from "react";

/**
 * Available AMD strategies
 */
export const AMD_STRATEGIES = [
  { value: "gemini", label: "Gemini Audio Analysis" },
  { value: "huggingface", label: "Hugging Face Model" },
  { value: "jambonz", label: "Jambonz SIP-based" },
] as const;

export type AMDStrategy = (typeof AMD_STRATEGIES)[number]["value"];

interface DialFormData {
  targetNumber: string;
  amdStrategy: AMDStrategy;
}

export function DialInterface() {
  const [formData, setFormData] = useState<DialFormData>({
    targetNumber: "",
    amdStrategy: "gemini",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Validates US toll-free number format
   */
  const validatePhoneNumber = (number: string): boolean => {
    // Remove all non-digit characters
    const digits = number.replace(/\D/g, "");
    // Check if it's a US toll-free number (800, 833, 844, 855, 866, 877, 888)
    const tollFreePrefixes = ["800", "833", "844", "855", "866", "877", "888"];
    if (digits.length === 11 && digits.startsWith("1")) {
      const prefix = digits.substring(1, 4);
      return tollFreePrefixes.includes(prefix);
    }
    if (digits.length === 10) {
      const prefix = digits.substring(0, 3);
      return tollFreePrefixes.includes(prefix);
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate phone number
    if (!formData.targetNumber.trim()) {
      setError("Please enter a target phone number");
      return;
    }

    if (!validatePhoneNumber(formData.targetNumber)) {
      setError(
        "Please enter a valid US toll-free number (e.g., 1-800-774-2678)"
      );
      return;
    }

    setLoading(true);

    try {
        // Send digits-only phone number to the API (server expects 10 or 11 digits)
        const digitsOnly = formData.targetNumber.replace(/\D/g, "");
        
      const response = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            targetNumber: digitsOnly,
          amdStrategy: formData.amdStrategy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate call");
      }

      setSuccess(
        `Call initiated successfully! Call ID: ${data.callId}. Status: ${data.status}`
      );
      
      // Reset form
      setFormData({
        targetNumber: "",
        amdStrategy: formData.amdStrategy,
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    
    // Format: 1-800-XXX-XXXX or 800-XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, targetNumber: formatted }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Target Number Input */}
        <div>
          <label
            htmlFor="targetNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Target Phone Number (US Toll-Free)
          </label>
          <input
            id="targetNumber"
            type="text"
            value={formData.targetNumber}
            onChange={handlePhoneChange}
            placeholder="1-800-774-2678"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Example test numbers: 1-800-774-2678 (Costco), 1-800-806-6453
            (Nike), 1-888-221-1161 (PayPal)
          </p>
        </div>

        {/* AMD Strategy Dropdown */}
        <div>
          <label
            htmlFor="amdStrategy"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            AMD Strategy
          </label>
          <select
            id="amdStrategy"
            value={formData.amdStrategy}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amdStrategy: e.target.value as AMDStrategy,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {AMD_STRATEGIES.map((strategy) => (
              <option key={strategy.value} value={strategy.value}>
                {strategy.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select the AMD strategy to use for this call. Each strategy has
            different accuracy, latency, and cost characteristics.
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Initiating Call..." : "Dial Now"}
        </button>
      </form>
    </div>
  );
}
