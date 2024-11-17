import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function DonationForm({ ngoId, onDonationSuccess }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();

  const handlePayment = async (response) => {
    try {
      const result = await api.transactions.verifyPayment({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });

      setAmount("");
      setLoading(false);
      onDonationSuccess?.(result);
    } catch (err) {
      setError("Payment verification failed");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please login to make a donation");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.transactions.createOrder(
        ngoId,
        parseFloat(amount)
      );

      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        name: "NGO Platform",
        description: "Donation",
        order_id: response.order_id,
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },
        handler: handlePayment,
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        setError("Payment failed: " + response.error.description);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError(err.message || "Failed to process donation");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setLoading(false);
    setError("");
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Make a Donation</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Amount (₹)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter amount in INR"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !amount}
          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            loading || !amount ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : "Donate Now"}
        </button>
      </form>
    </div>
  );
}

export default DonationForm;
