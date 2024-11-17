const API_BASE_URL = "http://localhost:8000/api";

// Helper function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = "csrftoken";
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Get headers with updated CSRF token and Auth token
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken(),
  };

  // Get auth token from localStorage
  const user = localStorage.getItem("user");
  if (user) {
    const { token } = JSON.parse(user);
    if (token) {
      headers["Authorization"] = `Token ${token}`; // or `Bearer ${token}` depending on your backend
    }
  }

  return headers;
};

// Default fetch options with dynamic headers
const getDefaultOptions = () => ({
  credentials: "include",
  headers: getHeaders(),
});

export const api = {
  auth: {
    login: async (username, password) => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/login/`, {
          method: "POST",
          ...getDefaultOptions(),
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    },

    register: async (username, password) => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/register/`, {
          method: "POST",
          ...getDefaultOptions(),
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },

  ngos: {
    list: async () => {
      const response = await fetch(`${API_BASE_URL}/ngos/`, {
        ...getDefaultOptions(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch NGOs");
      }
      return response.json();
    },

    getDetail: async (ngoId) => {
      const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/`, {
        ...getDefaultOptions(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch NGO details");
      }
      return response.json();
    },

    donate: async (ngoId, amount) => {
      const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/donate/`, {
        method: "POST",
        ...getDefaultOptions(),
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process donation");
      }
      return response.json();
    },

    getIncoming: async (ngoId) => {
      const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/incoming/`, {
        ...getDefaultOptions(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch incoming transactions");
      }
      return response.json();
    },

    addOutgoing: async (ngoId, amount, proofUrl) => {
      const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/outgoing/`, {
        method: "POST",
        ...getDefaultOptions(),
        body: JSON.stringify({
          amount,
          proof_url: proofUrl,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add outgoing transaction");
      }
      return response.json();
    },
  },

  transactions: {
    getDetail: async (transactionId) => {
      const response = await fetch(
        `${API_BASE_URL}/transactions/${transactionId}/`,
        {
          ...getDefaultOptions(),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transaction details");
      }
      return response.json();
    },

    createOrder: async (ngoId, amount) => {
      const response = await fetch(
        `${API_BASE_URL}/transactions/create-order/${ngoId}/`,
        {
          method: "POST",
          ...getDefaultOptions(),
          body: JSON.stringify({ amount }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }
      return response.json();
    },

    verifyPayment: async (paymentData) => {
      const response = await fetch(
        `${API_BASE_URL}/transactions/payment/verify/`,
        {
          method: "POST",
          ...getDefaultOptions(),
          body: JSON.stringify(paymentData),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to verify payment");
      }
      return response.json();
    },
  },
};
