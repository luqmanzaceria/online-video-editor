// src/components/FullScreenDropZone.tsx
import React from "react";

const FullScreenDropZone: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg text-gray-800 text-center">
        <h2 className="text-2xl font-bold mb-4">Drop your file here</h2>
        <p>Release to upload your video or audio file</p>
      </div>
    </div>
  );
};

export default FullScreenDropZone;
