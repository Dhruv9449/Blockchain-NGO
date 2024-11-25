import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useDropzone } from "react-dropzone"; // npm install react-dropzone
import { uploadToImgur } from "../../services/imgur";
import { ImageUploader } from "../common/ImageUploader";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function NGODashboard() {
  const { user } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState({
    donations: [],
    expenses: [],
  });
  const [filters, setFilters] = useState({
    type: "all",
    search: "",
    dateRange: "all",
    sortBy: "date-desc",
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    proof_url: "",
  });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Define fetchData function
  const fetchData = async () => {
    try {
      setLoading(true);
      const ngoData = await api.ngos.getAdminNGO();
      setNgo(ngoData);

      // Fetch both incoming and outgoing transactions
      const [incoming, outgoing] = await Promise.all([
        api.transactions.getIncomingTransactions(ngoData.id),
        api.transactions.getOutgoingTransactions(ngoData.id),
      ]);

      setTransactions({
        donations: incoming,
        expenses: outgoing,
      });

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Use fetchData in useEffect
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate totals
  const totalDonations = transactions.donations.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );
  const totalExpenses = transactions.expenses.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );
  const balance = totalDonations - totalExpenses;

  // Prepare chart data
  const getChartData = () => {
    // Group transactions by month
    const monthlyData = [
      ...transactions.donations,
      ...transactions.expenses,
    ].reduce((acc, tx) => {
      const date = new Date(tx.timestamp);
      const month = date.toLocaleString("default", { month: "short" });
      if (!acc[month]) {
        acc[month] = { donations: 0, expenses: 0 };
      }
      if (tx.transaction_type === "donation") {
        acc[month].donations += tx.amount;
      } else {
        acc[month].expenses += tx.amount;
      }
      return acc;
    }, {});

    return {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: "Donations",
          data: Object.values(monthlyData).map((d) => d.donations),
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Expenses",
          data: Object.values(monthlyData).map((d) => d.expenses),
          borderColor: "rgb(255, 99, 132)",
          tension: 0.1,
        },
      ],
    };
  };

  const getTransactionCountData = () => {
    const labels = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleDateString("default", { month: "short" });
    }).reverse();

    const donationCounts = labels.map((month) => {
      return transactions.donations.filter(
        (tx) =>
          new Date(tx.timestamp).toLocaleDateString("default", {
            month: "short",
          }) === month
      ).length;
    });

    const expenseCounts = labels.map((month) => {
      return transactions.expenses.filter(
        (tx) =>
          new Date(tx.timestamp).toLocaleDateString("default", {
            month: "short",
          }) === month
      ).length;
    });

    return {
      labels,
      datasets: [
        {
          label: "Number of Donations",
          data: donationCounts,
          backgroundColor: "rgba(34, 197, 94, 0.5)",
        },
        {
          label: "Number of Expenses",
          data: expenseCounts,
          backgroundColor: "rgba(239, 68, 68, 0.5)",
        },
      ],
    };
  };

  // Filter transactions
  const getFilteredTransactions = () => {
    let filtered = [];

    if (filters.type === "all" || filters.type === "donations") {
      filtered = [
        ...filtered,
        ...transactions.donations.map((t) => ({ ...t, type: "donation" })),
      ];
    }
    if (filters.type === "all" || filters.type === "expenses") {
      filtered = [
        ...filtered,
        ...transactions.expenses.map((t) => ({ ...t, type: "expense" })),
      ];
    }

    // Apply search
    if (filters.search) {
      filtered = filtered.filter((t) =>
        t.type === "expense"
          ? t.description?.toLowerCase().includes(filters.search.toLowerCase())
          : t.user?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "date-desc":
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case "amount-desc":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      // Add other sorting cases
    }

    return filtered;
  };

  // Use fetchData in handlers
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.ngos.addOutgoing(
        ngo.id,
        parseFloat(newExpense.amount),
        newExpense.proof_url
      );
      setNewExpense({ amount: "", description: "", proof_url: "" });
      await fetchData(); // Refresh data after adding expense
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddImage = (url) => {
    setNgo((prev) => ({
      ...prev,
      work_images: [...prev.work_images, url],
    }));
  };

  const handleRemoveImage = (index) => {
    setNgo((prev) => ({
      ...prev,
      work_images: prev.work_images.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateNGO = async (e) => {
    e.preventDefault();
    try {
      await api.ngos.updateNGO(ngo.id, ngo);
      await fetchData(); // Refresh data after updating NGO
    } catch (err) {
      setError(err.message);
    }
  };

  // Add unique IDs for charts
  const chartOptions = {
    line: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Monthly Transactions",
        },
      },
    },
    bar: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Transaction Count",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  };

  // Generic image upload handler
  const handleImageUpload = async (file, onSuccess) => {
    try {
      setUploading(true);
      const imgurUrl = await uploadToImgur(file);
      onSuccess(imgurUrl);
    } catch (error) {
      setError("Failed to upload image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Dropzone configuration for logo
  const logoDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await handleImageUpload(acceptedFiles[0], (url) =>
          setNgo((prev) => ({ ...prev, logo_url: url }))
        );
      }
    },
  });

  // Dropzone configuration for work images
  const workImagesDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: true,
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await handleImageUpload(file, handleAddImage);
      }
    },
  });

  // Update the Logo Preview section
  const LogoUploader = () => (
    <div className="mt-2 space-y-4">
      <div
        {...logoDropzone.getRootProps()}
        className={`flex flex-col items-center p-4 bg-gray-50 rounded-lg border-2 border-dashed 
          ${
            logoDropzone.isDragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300"
          }
          cursor-pointer hover:border-indigo-500 transition-colors`}
      >
        {ngo.logo_url ? (
          <img
            src={ngo.logo_url}
            alt="NGO Logo"
            className="w-32 h-32 object-cover rounded-lg shadow-md mb-4"
            onError={(e) => {
              e.target.src = "/placeholder-logo.png";
              e.target.className =
                "w-32 h-32 object-contain p-4 bg-gray-100 rounded-lg";
            }}
          />
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-1 text-sm text-gray-600">
              Drop logo here or click to select
            </p>
          </div>
        )}
        <input {...logoDropzone.getInputProps()} />
      </div>
      {uploading && (
        <div className="text-center text-sm text-gray-500">Uploading...</div>
      )}
    </div>
  );

  // Update the Work Images section
  const WorkImagesUploader = () => (
    <div className="space-y-6">
      <div
        {...workImagesDropzone.getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg text-center
          ${
            workImagesDropzone.isDragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300"
          }
          cursor-pointer hover:border-indigo-500 transition-colors`}
      >
        <input {...workImagesDropzone.getInputProps()} />
        <div className="space-y-1">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
              <span>Upload images</span>
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>

      {uploading && (
        <div className="text-center text-sm text-gray-500">Uploading...</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ngo.work_images?.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Work ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full 
                opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!ngo) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NGO Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={ngo.logo_url}
                alt={ngo.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{ngo.name}</h1>
                <p className="text-sm text-gray-500">NGO Dashboard</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "overview"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("expenses")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "expenses"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Add Expense
              </button>
              <button
                onClick={() => setActiveTab("images")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "images"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Manage Images
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "settings"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                NGO Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Donations
                </h3>
                <p className="text-2xl font-semibold text-green-600">
                  ₹{totalDonations.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Expenses
                </h3>
                <p className="text-2xl font-semibold text-red-600">
                  ₹{totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">
                  Current Balance
                </h3>
                <p className="text-2xl font-semibold text-blue-600">
                  ₹{balance.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-64">
                  <Line
                    key="line-chart"
                    data={getChartData()}
                    options={chartOptions.line}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-64">
                  <Bar
                    key="bar-chart"
                    data={getTransactionCountData()}
                    options={chartOptions.bar}
                  />
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Transactions</h2>
              </div>

              {/* Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="px-4 py-2 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                  />
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="rounded-md border-gray-300"
                  >
                    <option value="all">All Transactions</option>
                    <option value="donations">Donations Only</option>
                    <option value="expenses">Expenses Only</option>
                  </select>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: e.target.value,
                      }))
                    }
                    className="rounded-md border-gray-300"
                  >
                    <option value="date-desc">Latest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Highest Amount</option>
                    <option value="amount-asc">Lowest Amount</option>
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blockchain Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredTransactions().map((transaction, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.type === "donation"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {transaction.type === "donation" ? (
                            transaction.user
                          ) : (
                            <div>
                              <p className="font-medium">
                                {transaction.description}
                              </p>
                              {transaction.proof_url && (
                                <a
                                  href={transaction.proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 text-xs mt-1 inline-block"
                                >
                                  View Proof
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 break-all">
                          {transaction.blockchain_hash}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Add Expense Tab */}
        {activeTab === "expenses" && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Add New Expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300"
                    placeholder="Enter description"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Proof Image URL
                  </label>
                  <div className="space-y-4">
                    <input
                      type="url"
                      value={newExpense.proof_url}
                      onChange={(e) =>
                        setNewExpense((prev) => ({
                          ...prev,
                          proof_url: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300"
                      placeholder="Enter proof image URL"
                    />
                    {newExpense.proof_url && (
                      <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                        <img
                          src={newExpense.proof_url}
                          alt="Expense proof"
                          className="h-48 object-contain rounded-lg"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                >
                  Add Expense
                </button>
              </form>
            </div>

            {/* Recent Expenses List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Recent Expenses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transactions.expenses.map((expense, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {expense.proof_url && (
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={expense.proof_url}
                          alt="Expense proof"
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                            e.target.className = "object-contain p-4";
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{expense.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-2">
                        Description:
                      </p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md mb-3">
                        {expense.description}
                      </p>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          Blockchain Hash:
                        </p>
                        <p className="text-xs text-gray-400 font-mono break-all">
                          {expense.blockchain_hash}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manage Images Tab */}
        {activeTab === "images" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Manage Work Images</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Work Image
                </label>
                <div className="space-y-4">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter image URL"
                  />
                  {newImageUrl && (
                    <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                      <img
                        src={newImageUrl}
                        alt="New work"
                        className="h-48 object-contain rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png";
                        }}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrl) {
                        handleAddImage(newImageUrl);
                        setNewImageUrl("");
                      }
                    }}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Image
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {ngo.work_images?.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Work ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NGO Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">NGO Settings</h2>
            <form onSubmit={handleUpdateNGO} className="space-y-6">
              {/* Two-column layout for basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={ngo.name}
                      onChange={(e) =>
                        setNgo((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={ngo.description}
                      onChange={(e) =>
                        setNgo((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      rows={4}
                      required
                    />
                  </div>
                </div>

                {/* Logo Preview and URL Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Logo
                    </label>
                    <div className="space-y-4">
                      {ngo.logo_url && (
                        <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                          <img
                            src={ngo.logo_url}
                            alt="NGO Logo"
                            className="w-32 h-32 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              e.target.src = "/placeholder-logo.png";
                              e.target.className =
                                "w-32 h-32 object-contain p-4 bg-gray-100 rounded-lg";
                            }}
                          />
                        </div>
                      )}
                      <input
                        type="url"
                        value={ngo.logo_url}
                        onChange={(e) =>
                          setNgo((prev) => ({
                            ...prev,
                            logo_url: e.target.value,
                          }))
                        }
                        className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter logo URL"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificate URL
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="url"
                        value={ngo.certificate_url}
                        onChange={(e) =>
                          setNgo((prev) => ({
                            ...prev,
                            certificate_url: e.target.value,
                          }))
                        }
                        className="block w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                      {ngo.certificate_url && (
                        <a
                          href={ngo.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-600 hover:text-indigo-800"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                >
                  Update NGO Details
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default NGODashboard;
