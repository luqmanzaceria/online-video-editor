// src/components/LeftSidebar.tsx
import React from "react";

const LeftSidebar: React.FC<{
  activePanel: string | null;
  setActivePanel: (panel: string | null) => void;
}> = ({ activePanel, setActivePanel }) => {
  const buttons = [
    { icon: "⚙️", name: "settings", label: "Settings" },
    { icon: "📁", name: "media", label: "Media" },
    { icon: "🎵", name: "audio", label: "Audio" },
    { icon: "⭐", name: "elements", label: "Elements" },
    { icon: "T", name: "text", label: "Text" },
    { icon: "🔀", name: "transitions", label: "Transitions" },
    { icon: "🎨", name: "filters", label: "Filters" },
  ];

  return (
    <div className="w-20 bg-gray-900 flex flex-col items-center py-4 border-r border-gray-800">
      <button className="mb-6 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
      {buttons.map((button) => (
        <button
          key={button.name}
          className={`w-16 flex flex-col items-center justify-center py-3 mb-4 rounded-lg ${
            activePanel === button.name
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          } transition-all duration-200 ease-in-out`}
          onClick={() =>
            setActivePanel(activePanel === button.name ? null : button.name)
          }
        >
          <span className="text-2xl mb-1">{button.icon}</span>
          <span className="text-xs">{button.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LeftSidebar;
