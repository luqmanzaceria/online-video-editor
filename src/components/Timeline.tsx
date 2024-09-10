import React, { useState, useRef, useEffect, useCallback } from "react";

interface Track {
  id: string;
  file: File;
  type: "video" | "audio" | "image";
  startTime: number;
  duration: number;
  row: number;
}

interface TimelineProps {
  tracks: Track[];
  onSplitTrack: (trackId: string, splitTime: number) => void;
  onDeleteTrack: (trackId: string) => void;
  onMoveTrack: (trackId: string, newStartTime: number, newRow: number) => void;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  totalDuration: number;
}

const Timeline: React.FC<TimelineProps> = ({
  tracks,
  onSplitTrack,
  onDeleteTrack,
  onMoveTrack,
  currentTime,
  onTimeUpdate,
  totalDuration,
}) => {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    trackId: null,
  });
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = useCallback(
    (event: React.MouseEvent) => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickTime = (clickX / rect.width) * totalDuration;
        onTimeUpdate(Math.max(0, Math.min(clickTime, totalDuration)));
      }
    },
    [totalDuration, onTimeUpdate]
  );

  const renderTimeMarkers = () => {
    const markers = [];
    for (let i = 0; i <= totalDuration; i += 5) {
      markers.push(
        <div key={i} className="flex-grow flex flex-col items-center">
          <span className="text-xs text-gray-400">{i}s</span>
          <span className="h-2 w-px bg-gray-600 mt-1"></span>
        </div>
      );
    }
    return markers;
  };

  return (
    <div
      className="h-full bg-gray-800 p-4 flex flex-col"
      ref={timelineRef}
      onClick={handleTimelineClick}
    >
      <div className="flex-grow flex flex-col overflow-y-auto">
        <div className="h-8 mb-2 flex sticky top-0 bg-gray-800 z-10 border-b border-gray-700">
          {renderTimeMarkers()}
        </div>
        <div className="flex-grow relative">
          {tracks.map((track) => (
            <TimelineTrack
              key={track.id}
              track={track}
              onContextMenu={setContextMenu}
              onMoveTrack={onMoveTrack}
              totalDuration={totalDuration}
            />
          ))}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{
              left: `${Math.max(0, (currentTime / totalDuration) * 100)}%`,
            }}
          ></div>
        </div>
      </div>
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          trackId={contextMenu.trackId}
          onSplit={() => onSplitTrack(contextMenu.trackId, currentTime)}
          onDelete={() => onDeleteTrack(contextMenu.trackId)}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        />
      )}
    </div>
  );
};

const TimelineTrack: React.FC<{
  track: Track;
  onContextMenu: (menu: {
    visible: boolean;
    x: number;
    y: number;
    trackId: string;
  }) => void;
  onMoveTrack: (trackId: string, newStartTime: number, newRow: number) => void;
  totalDuration: number;
}> = ({ track, onContextMenu, onMoveTrack, totalDuration }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, startTime: 0, row: 0 });

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    const trackElem = trackRef.current;
    if (trackElem) {
      startPos.current = {
        x: event.clientX,
        y: event.clientY,
        startTime: track.startTime,
        row: track.row,
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    const dx = event.clientX - startPos.current.x;
    const rect = trackRef.current?.parentElement?.getBoundingClientRect();
    if (rect) {
      const newStartTime = Math.max(
        0,
        (dx / rect.width) * totalDuration + startPos.current.startTime
      );
      onMoveTrack(track.id, newStartTime, startPos.current.row); // Simplified: assumes no row change
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const trackStyle = {
    left: `${(track.startTime / totalDuration) * 100}%`,
    width: `${(track.duration / totalDuration) * 100}%`,
    top: `${track.row * 40}px`,
  };

  const getTrackColor = () => {
    switch (track.type) {
      case "video":
        return "bg-blue-500";
      case "audio":
        return "bg-green-500";
      case "image":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      ref={trackRef}
      className={`absolute h-8 ${getTrackColor()} bg-opacity-75 rounded-md cursor-move flex items-center px-2 shadow-md`}
      style={trackStyle}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          trackId: track.id,
        });
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="text-white truncate text-sm font-medium">
        {track.file.name} ({track.type})
      </div>
    </div>
  );
};

const ContextMenu: React.FC<{
  x: number;
  y: number;
  trackId: string;
  onSplit: () => void;
  onDelete: () => void;
  onClose: () => void;
}> = ({ x, y, onSplit, onDelete, onClose }) => {
  return (
    <div
      className="absolute bg-gray-700 rounded-md shadow-lg z-30"
      style={{ top: y, left: x }}
    >
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-white"
        onClick={onSplit}
      >
        Split
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-white"
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  );
};

export default Timeline;
