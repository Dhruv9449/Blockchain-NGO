import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function NGODashboard() {
  const { user } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // details, expenses, images
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    proof_url: "",
  });

  // Form states for NGO details
  const [ngoDetails, setNgoDetails] = useState({
    name: "",
    description: "",
    logo_url: "",
    certificate_url: "",
    work_images: [],
  });

  // Move fetchNGODetails outside useEffect so it can be reused
  const fetchNGODetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.ngos.getAdminNGO();
      console.log("NGO Details Response:", response);
      setNgo(response);
      setNgoDetails({
        name: response.name,
        description: response.description,
        logo_url: response.logo_url,
        certificate_url: response.certificate_url,
        work_images: response.work_images || [],
      });
    } catch (err) {
      console.error("Error fetching NGO details:", err);
      setError(err.message || "Failed to fetch NGO details");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNGODetails();
  }, []);

  const handleUpdateNGO = async (e) => {
    e.preventDefault();
    try {
      await api.ngos.updateNGO(ngo.id, ngoDetails);
      await fetchNGODetails(); // Refresh data after update
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.ngos.addOutgoing(
        ngo.id,
        newExpense.amount,
        newExpense.proof_url
      );
      setNewExpense({ amount: "", description: "", proof_url: "" });
      await fetchNGODetails(); // Refresh data after adding expense
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddImage = (url) => {
    setNgoDetails((prev) => ({
      ...prev,
      work_images: [...prev.work_images, url],
    }));
  };

  const handleRemoveImage = (index) => {
    setNgoDetails((prev) => ({
      ...prev,
      work_images: prev.work_images.filter((_, i) => i !== index),
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!ngo) return <div>No NGO found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">NGO Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === "details"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : ""
          }`}
          onClick={() => setActiveTab("details")}
        >
          NGO Details
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "expenses"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : ""
          }`}
          onClick={() => setActiveTab("expenses")}
        >
          Add Expense
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "images"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : ""
          }`}
          onClick={() => setActiveTab("images")}
        >
          Manage Images
        </button>
      </div>

      {/* NGO Details Form */}
      {activeTab === "details" && (
        <form onSubmit={handleUpdateNGO} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={ngoDetails.name}
              onChange={(e) =>
                setNgoDetails((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={ngoDetails.description}
              onChange={(e) =>
                setNgoDetails((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo URL
            </label>
            <input
              type="url"
              value={ngoDetails.logo_url}
              onChange={(e) =>
                setNgoDetails((prev) => ({ ...prev, logo_url: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certificate URL
            </label>
            <input
              type="url"
              value={ngoDetails.certificate_url}
              onChange={(e) =>
                setNgoDetails((prev) => ({
                  ...prev,
                  certificate_url: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Update NGO Details
          </button>
        </form>
      )}

      {/* Add Expense Form */}
      {activeTab === "expenses" && (
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
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
              value={newExpense.proof_url}
              onChange={(e) =>
                setNewExpense((prev) => ({
                  ...prev,
                  proof_url: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Add Expense
          </button>
        </form>
      )}

      {/* Manage Images */}
      {activeTab === "images" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Add New Image URL
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="url"
                placeholder="Enter image URL"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    handleAddImage(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ngoDetails.work_images.map((url, index) => (
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
      )}
    </div>
  );
}

export default NGODashboard;
