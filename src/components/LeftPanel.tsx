// src/components/LeftPanel.tsx
import React from "react";

const LeftPanel: React.FC<{ panelType: string }> = ({ panelType }) => {
  return (
    <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
      <h2 className="text-white text-lg font-semibold mb-4 capitalize">
        {panelType}
      </h2>
      {panelType === "settings" && <ProjectSettings />}
      {/* Add other panel contents based on panelType */}
    </div>
  );
};

const ProjectSettings: React.FC = () => (
  <div>
    <div className="mb-4">
      <label className="block text-white mb-2">Aspect Ratio</label>
      <select className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option>16:9</option>
        <option>4:3</option>
        <option>1:1</option>
      </select>
    </div>
    {/* Add more project settings here */}
  </div>
);

export default LeftPanel;
