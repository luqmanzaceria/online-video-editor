// src/components/TopBar.tsx
import React from "react";

const TopBar: React.FC = () => {
  return (
    <div className="h-14 bg-gray-900 flex items-center justify-between px-4 border-b border-gray-800">
      <div className="text-white text-lg font-semibold">Video Editor</div>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Project Name"
          className="bg-gray-800 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
        <select className="bg-gray-800 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
          <option>Preview: Low</option>
          <option>Preview: High</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-all duration-200">
          Share
        </button>
      </div>
    </div>
  );
};

export default TopBar;
