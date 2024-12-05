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
const getDefaultOptions = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  // Get auth token from localStorage
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (userData && userData.token) {
        headers["Authorization"] = `Token ${userData.token}`;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  return {
    headers: headers,
  };
};

export const api = {
  auth: {
    login: async (username, password) => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error || "Login failed",
          };
        }

        return data; // Should contain { success: true, data: {...} }
      } catch (error) {
        console.error("API login error:", error);
        throw new Error("Network error");
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
      try {
        const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/`, {
          ...getDefaultOptions(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch NGO details");
        }

        const data = await response.json();
        console.log("API Response:", data); // Add this debug log

        // Ensure work_images is always an array
        return {
          ...data,
          work_images: data.work_images || [],
        };
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
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
      const options = getDefaultOptions();

      const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/incoming/`, {
        method: "GET",
        ...options,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch incoming transactions");
      }
      return response.json();
    },

    getOutgoing: async (ngoId) => {
      const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/outgoing/`, {
        ...getDefaultOptions(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch outgoing transactions");
      }
      return response.json();
    },

    addOutgoing: async (ngoId, amount, proofUrl, description) => {
      const options = getDefaultOptions();

      const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/outgoing/`, {
        method: "POST",
        ...options,
        body: JSON.stringify({
          amount,
          proof_url: proofUrl,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to add outgoing transaction"
        );
      }
      return response.json();
    },

    getAdminNGO: async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          throw new Error("No user data found");
        }

        const { token } = JSON.parse(userData);
        if (!token) {
          throw new Error("No token found");
        }

        console.log("Making request with token:", token); // Debug log

        const response = await fetch(`${API_BASE_URL}/ngos/admin/ngo/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`, // Make sure there's a space after "Token"
          },
          credentials: "include", // Include credentials in the request
        });

        console.log("Response status:", response.status); // Debug log

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.detail || "Failed to fetch NGO details");
        }

        return response.json();
      } catch (error) {
        console.error("API call error:", error);
        throw error;
      }
    },

    updateNGO: async (ngoId, data) => {
      const options = getDefaultOptions();

      const response = await fetch(`${API_BASE_URL}/ngos/admin/ngo/${ngoId}/`, {
        method: "PUT",
        ...options,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update NGO");
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

    list: async (queryString = "") => {
      const response = await fetch(
        `${API_BASE_URL}/transactions/list/?${queryString}`,
        {
          ...getDefaultOptions(),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch transactions");
      }
      return response.json();
    },

    getIncomingTransactions: async (ngoId) => {
      const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/incoming/`, {
        ...getDefaultOptions(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch incoming transactions");
      }
      return response.json();
    },

    getOutgoingTransactions: async (ngoId) => {
      const response = await fetch(`${API_BASE_URL}/ngos/${ngoId}/outgoing/`, {
        ...getDefaultOptions(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch outgoing transactions");
      }
      return response.json();
    },
  },
};
