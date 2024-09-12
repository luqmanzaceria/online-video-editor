import React, { useState, useRef, useCallback } from "react";
import { useTimeline, Track } from "@/context/TimelineContext";

const Timeline: React.FC = () => {
  const { state, dispatch } = useTimeline();
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    trackId: null as string | null,
  });
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = useCallback(
    (event: React.MouseEvent) => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickTime = (clickX / rect.width) * state.totalDuration;
        dispatch({
          type: "SET_CURRENT_TIME",
          payload: Math.max(0, Math.min(clickTime, state.totalDuration)),
        });
      }
    },
    [state.totalDuration, dispatch]
  );

  const handleSplitTrack = useCallback(
    (trackId: string, splitTime: number) => {
      dispatch({ type: "SPLIT_TRACK", payload: { trackId, splitTime } });
      setContextMenu({ ...contextMenu, visible: false });
    },
    [dispatch]
  );

  const handleDeleteTrack = useCallback(
    (trackId: string) => {
      dispatch({ type: "DELETE_TRACK", payload: trackId });
      setContextMenu({ ...contextMenu, visible: false });
    },
    [dispatch]
  );

  const handleMoveTrack = useCallback(
    (trackId: string, newStartTime: number, newRow: number) => {
      const track = state.tracks.find((t) => t.id === trackId);
      if (track) {
        dispatch({
          type: "UPDATE_TRACK",
          payload: { ...track, startTime: newStartTime, row: newRow },
        });
      }
    },
    [state.tracks, dispatch]
  );

  const renderTimeMarkers = () => {
    const markers = [];
    for (let i = 0; i <= state.totalDuration; i += 5) {
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
          {state.tracks.map((track) => (
            <TimelineTrack
              key={track.id}
              track={track}
              onContextMenu={setContextMenu}
              onMoveTrack={handleMoveTrack}
              totalDuration={state.totalDuration}
            />
          ))}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{
              left: `${Math.max(
                0,
                (state.currentTime / state.totalDuration) * 100
              )}%`,
            }}
          ></div>
        </div>
      </div>
      {contextMenu.visible && contextMenu.trackId && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          trackId={contextMenu.trackId}
          onSplit={() =>
            handleSplitTrack(contextMenu.trackId!, state.currentTime)
          }
          onDelete={() => handleDeleteTrack(contextMenu.trackId!)}
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
    const dy = event.clientY - startPos.current.y;
    const rect = trackRef.current?.parentElement?.getBoundingClientRect();
    if (rect) {
      const newStartTime = Math.max(
        0,
        (dx / rect.width) * totalDuration + startPos.current.startTime
      );
      const newRow = Math.floor((event.clientY - rect.top) / 40);
      onMoveTrack(track.id, newStartTime, newRow);
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
