import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Updated user state:", user);
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (username, password) => {
    try {
      const response = await api.auth.login(username, password);
      console.log("Login response:", response);

      if (response.success) {
        const userData = {
          username: response.data.username,
          token: response.data.token,
          isNGOAdmin: response.data.is_ngo_admin,
          ngoId: response.data.ngo_id,
        };

        console.log("Saving user data:", userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        if (userData.isNGOAdmin) {
          navigate("/ngo-admin");
        } else {
          navigate("/");
        }
        return { success: true };
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated: Boolean(user),
    isNGOAdmin: Boolean(user?.isNGOAdmin),
    ngoId: user?.ngoId,
    token: user?.token,
  };

  console.log("Auth context value:", contextValue);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
