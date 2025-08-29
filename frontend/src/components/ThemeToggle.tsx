import { useContext } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid"; // Example icons
import { ThemeContext } from "../context/ThemeContext";

function ThemeToggle() {
  const { mode, toggleMode } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200
                 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {mode === "dark" ? (
        <SunIcon className="h-6 w-6" />
      ) : (
        <MoonIcon className="h-6 w-6" />
      )}
    </button>
  );
}

export default ThemeToggle;
