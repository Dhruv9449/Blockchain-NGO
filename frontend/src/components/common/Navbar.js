import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/outline";

function Navbar() {
  const { isAuthenticated, isNGOAdmin, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/favicon.svg" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
                BlockchainNGO
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                {isNGOAdmin && (
                  <Link
                    to="/ngo-admin"
                    className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <ChartBarSquareIcon className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                )}
                {/* <div className="flex items-center space-x-2 text-gray-600">
                  <UserCircleIcon className="h-5 w-5" />
                  <span>{user.username}</span>
                </div> */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 
                           transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
            {isAuthenticated ? (
              <>
                {isNGOAdmin && (
                  <Link
                    to="/ngo-admin"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <ChartBarSquareIcon className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                )}
                {/* <div className="flex items-center space-x-2 px-3 py-2 text-gray-600">
                  <UserCircleIcon className="h-5 w-5" />
                  <span>{user.username}</span>
                </div> */}
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
