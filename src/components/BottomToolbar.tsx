// src/components/BottomToolbar.tsx
import React from "react";

const BottomToolbar: React.FC = () => {
  return (
    <div className="h-16 bg-gray-900 flex items-center justify-between px-6 border-t border-gray-800">
      <div className="flex items-center space-x-4">
        <button className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all duration-200">
          Zoom In
        </button>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all duration-200">
          Zoom Out
        </button>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all duration-200">
          Fit
        </button>
      </div>
      <div>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all duration-200">
          Split
        </button>
      </div>
    </div>
  );
};

export default BottomToolbar;
