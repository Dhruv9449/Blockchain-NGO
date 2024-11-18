import { useState } from "react";
import { api } from "../../services/api";

function ExpenseForm({ ngoId, onSuccess }) {
  const [expense, setExpense] = useState({
    amount: "",
    description: "",
    proof_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.ngos.addOutgoing(ngoId, expense.amount, expense.proof_url);
      setExpense({ amount: "", description: "", proof_url: "" });
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="number"
          value={expense.amount}
          onChange={(e) =>
            setExpense((prev) => ({ ...prev, amount: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={expense.description}
          onChange={(e) =>
            setExpense((prev) => ({ ...prev, description: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Proof URL
        </label>
        <input
          type="url"
          value={expense.proof_url}
          onChange={(e) =>
            setExpense((prev) => ({ ...prev, proof_url: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 
          ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Adding..." : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;
