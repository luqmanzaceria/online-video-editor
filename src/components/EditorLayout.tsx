// src/components/EditorLayout.tsx
import React, { ReactNode } from "react";

interface EditorLayoutProps {
  children: ReactNode;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}) => {
  return (
    <div
      className="h-screen flex flex-col bg-gray-900 text-white"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
};

export default EditorLayout;
