import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

const Navbar = () => {
  const location = useLocation();
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">AI Attendance</span>
          </Link>

          {/* User Info & Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <div className="flex items-center space-x-2">
                <img src={user.picture} alt={user.nickname} className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium text-gray-700">Welcome, {user.nickname}!</span>
              </div>
            )}
            {isAuthenticated ? (
              <div className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/camera"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/camera')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Camera
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/about')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                About
              </Link>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition"
                >
                Log Out
              </button>
                </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;