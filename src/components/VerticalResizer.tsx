// src/components/VerticalResizer.tsx
import React, { useState, useCallback } from "react";

interface VerticalResizerProps {
  onResize: (deltaY: number) => void;
}

const VerticalResizer: React.FC<VerticalResizerProps> = ({ onResize }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        onResize(e.movementY);
      }
    },
    [isDragging, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove as any);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className="h-2 bg-gray-800 cursor-ns-resize flex items-center justify-center"
      onMouseDown={handleMouseDown}
    >
      <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
    </div>
  );
};

export default VerticalResizer;
