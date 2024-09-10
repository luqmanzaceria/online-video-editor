// src/components/RightSidebar.tsx
import React from "react";

interface RightSidebarProps {
  selectedItem: any; // Replace 'any' with a more specific type based on your needs
}

const RightSidebar: React.FC<RightSidebarProps> = ({ selectedItem }) => {
  return (
    <div className="w-64 bg-gray-800 p-4">
      {!selectedItem ? (
        <ProjectSettings />
      ) : (
        <ItemSettings item={selectedItem} />
      )}
    </div>
  );
};

const ProjectSettings: React.FC = () => (
  <div>
    <h2 className="text-white text-lg mb-4">Project Settings</h2>
    <div className="mb-4">
      <label className="block text-white mb-2">Aspect Ratio</label>
      <select className="w-full bg-gray-700 text-white px-2 py-1 rounded">
        <option>16:9</option>
        <option>4:3</option>
        <option>1:1</option>
      </select>
    </div>
    {/* Add more project settings here */}
  </div>
);

const ItemSettings: React.FC<{ item: any }> = ({ item }) => (
  <div>
    <h2 className="text-white text-lg mb-4">Item Settings</h2>
    {/* Add item-specific settings here based on the type of item selected */}
  </div>
);

export default RightSidebar;
