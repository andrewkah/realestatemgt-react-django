// src/components/Layout.tsx
import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle"; // Import the ThemeToggle component

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-base-background text-base-text">
      {/* Header */}
      <header className="bg-card-background shadow-md py-4 px-6 flex justify-between items-center border-b border-border">
        <div className="flex items-center">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-primary-light dark:text-primary-dark"
          >
            RealEstateApp
          </Link>
          {/* Main Navigation (e.g., for desktop) */}
          <nav className="hidden md:flex ml-10 space-x-6">
            <Link
              to="/dashboard"
              className="text-base-text hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/properties"
              className="text-base-text hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200"
            >
              Properties
            </Link>
            <Link
              to="/profile"
              className="text-base-text hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200"
            >
              Profile
            </Link>
            {/* Add more navigation links here */}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* User/Auth related items (e.g., user name, logout button) */}
          {/* For demonstration, let's assume a dummy user menu or direct profile link */}
          <Link
            to="/profile"
            className="text-base-text hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200 hidden sm:block"
          >
            Welcome, John!
          </Link>

          {/* THEME TOGGLE PLACEMENT */}
          <ThemeToggle />
          {/* End THEME TOGGLE PLACEMENT */}

          {/* Mobile menu button could go here too */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-6">{children}</main>

      {/* Footer */}
      <footer className="bg-card-background py-4 px-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-border">
        &copy; {new Date().getFullYear()} RealEstateApp. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
