// src/components/Timeline.tsx
import React, { useState, useRef, useEffect } from "react";

const Timeline: React.FC<{
  tracks: any[];
  onSplitTrack: (trackId: string, splitTime: number) => void;
  onDeleteTrack: (trackId: string) => void;
  onMoveTrack: (trackId: string, newStartTime: number) => void;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
}> = ({
  tracks,
  onSplitTrack,
  onDeleteTrack,
  onMoveTrack,
  currentTime,
  onTimeUpdate,
}) => {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    trackId: null,
  });
  const timelineRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu.visible && !event.target.closest(".context-menu")) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  const handleContextMenu = (event, trackId) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      trackId,
    });
  };

  const handleSplit = () => {
    onSplitTrack(contextMenu.trackId, currentTime);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDelete = () => {
    onDeleteTrack(contextMenu.trackId);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleTimelineClick = (event) => {
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const clickTime =
      ((event.clientX - timelineRect.left) / timelineRect.width) * 30;
    onTimeUpdate(clickTime);
  };

  return (
    <div
      className="h-full bg-gray-900 p-4 flex flex-col"
      ref={timelineRef}
      onClick={handleTimelineClick}
    >
      <div className="flex-grow flex flex-col">
        {/* Time markers */}
        <div className="h-6 mb-2 flex text-gray-400 text-xs">
          {[0, 5, 10, 15, 20, 25, 30].map((time) => (
            <div key={time} className="flex-grow flex flex-col items-center">
              <span>{time}s</span>
              <span className="h-2 w-px bg-gray-700 mt-1"></span>
            </div>
          ))}
        </div>
        {/* Scrollable timeline area */}
        <div className="flex-grow bg-gray-800 rounded-lg relative overflow-y-auto scrollbar-thin">
          <div className="absolute top-0 left-0 right-0 min-h-full">
            {tracks.map((track) => (
              <TimelineTrack
                key={track.id}
                track={track}
                onContextMenu={handleContextMenu}
                onMoveTrack={onMoveTrack}
              />
            ))}
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
            style={{ left: `${(currentTime / 30) * 100}%` }}
          ></div>
        </div>
      </div>
      {contextMenu.visible && (
        <div
          className="absolute bg-gray-700 rounded-md shadow-lg z-50 context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-600"
            onClick={handleSplit}
          >
            Split
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-600"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const TimelineTrack: React.FC<{
  track: any;
  onContextMenu: (event: React.MouseEvent, trackId: string) => void;
  onMoveTrack: (trackId: string, newStartTime: number) => void;
}> = ({ track, onContextMenu, onMoveTrack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef(null);

  const handleMouseDown = (event) => {
    setIsDragging(true);
    const trackRect = trackRef.current.getBoundingClientRect();
    setDragOffset(event.clientX - trackRect.left);
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const timelineRect = trackRef.current
        .closest(".bg-gray-800")
        .getBoundingClientRect();
      const newStartTime = Math.max(
        0,
        ((event.clientX - timelineRect.left - dragOffset) /
          timelineRect.width) *
          30
      );
      onMoveTrack(track.id, newStartTime);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const trackStyle = {
    left: `${(track.startTime / 30) * 100}%`,
    width: `${(track.duration / 30) * 100}%`,
  };

  return (
    <div
      ref={trackRef}
      className="absolute h-12 bg-blue-500 bg-opacity-50 rounded-md cursor-move"
      style={trackStyle}
      onContextMenu={(e) => onContextMenu(e, track.id)}
      onMouseDown={handleMouseDown}
    >
      <div className="px-2 py-1 text-white truncate">{track.file.name}</div>
    </div>
  );
};

export default Timeline;
