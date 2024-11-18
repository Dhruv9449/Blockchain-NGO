import { useState, useEffect } from "react";
import { api } from "../../services/api";

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    user_id: "",
    min_amount: "",
    max_amount: "",
    sort_order: "desc",
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.user_id) queryParams.append("user_id", filters.user_id);
      if (filters.min_amount)
        queryParams.append("min_amount", filters.min_amount);
      if (filters.max_amount)
        queryParams.append("max_amount", filters.max_amount);
      queryParams.append("sort_order", filters.sort_order);

      const response = await api.transactions.list(queryParams.toString());
      setTransactions(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="user_id"
            placeholder="User ID"
            value={filters.user_id}
            onChange={handleFilterChange}
            className="border rounded p-2"
          />
          <input
            type="number"
            name="min_amount"
            placeholder="Min Amount"
            value={filters.min_amount}
            onChange={handleFilterChange}
            className="border rounded p-2"
          />
          <input
            type="number"
            name="max_amount"
            placeholder="Max Amount"
            value={filters.max_amount}
            onChange={handleFilterChange}
            className="border rounded p-2"
          />
          <select
            name="sort_order"
            value={filters.sort_order}
            onChange={handleFilterChange}
            className="border rounded p-2"
          >
            <option value="desc">Latest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{tx.ngo}</h3>
                <p className="text-sm text-gray-600">By {tx.user}</p>
                <p className="text-sm text-gray-600">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${tx.amount}</p>
                <p className="text-sm text-gray-600">{tx.transaction_type}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 break-all">
                Hash: {tx.blockchain_hash}
              </p>
              {tx.proof_url && (
                <a
                  href={tx.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 text-sm hover:text-indigo-800"
                >
                  View Proof
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransactionList;
