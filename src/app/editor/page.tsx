// src/app/editor/page.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import EditorLayout from "@/components/EditorLayout";
import VideoPreview from "@/components/VideoPreview";
import Timeline from "@/components/Timeline";
import LeftSidebar from "@/components/LeftSidebar";
import LeftPanel from "@/components/LeftPanel";
import TopBar from "@/components/TopBar";
import VerticalResizer from "@/components/VerticalResizer";

interface Track {
  id: string;
  file: File;
  type: "video" | "audio" | "image";
  startTime: number;
  duration: number;
  row: number;
}

export default function Editor() {
  const [activePanel, setActivePanel] = useState(null);
  const [previewHeight, setPreviewHeight] = useState(50); // Percentage
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const requestRef = useRef<number>();

  const handleResize = useCallback((deltaY: number) => {
    setPreviewHeight((prevHeight) => {
      const newHeight = prevHeight + (deltaY / window.innerHeight) * 100;
      return Math.max(20, Math.min(80, newHeight)); // Limit between 20% and 80%
    });
  }, []);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current++;
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const droppedFiles = Array.from(event.dataTransfer.files);
    addNewTracks(droppedFiles);
  }, []);

  const addNewTracks = useCallback((files: File[]) => {
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("audio/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("image/")
    );

    setTracks((prevTracks) => {
      const newTracks: Track[] = [];
      let maxRow = Math.max(...prevTracks.map((track) => track.row), -1);

      validFiles.forEach((file) => {
        const fileType = file.type.startsWith("audio/")
          ? "audio"
          : file.type.startsWith("video/")
          ? "video"
          : "image";

        maxRow++;
        newTracks.push({
          id: Date.now() + Math.random().toString(),
          file,
          type: fileType,
          startTime: 0,
          duration: 10, // Placeholder duration
          row: maxRow,
        });

        // If it's a video file, add an audio track as well
        if (fileType === "video") {
          maxRow++;
          newTracks.push({
            id: Date.now() + Math.random().toString(),
            file,
            type: "audio",
            startTime: 0,
            duration: 10, // Placeholder duration
            row: maxRow,
          });
        }
      });

      return [...prevTracks, ...newTracks];
    });
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const uploadedFiles = Array.from(event.target.files);
        addNewTracks(uploadedFiles);
      }
    },
    [addNewTracks]
  );

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const animate = useCallback(
    (time: number) => {
      if (isPlaying) {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + 0.016; // Assuming 60fps
          return nextTime >= 30 ? 0 : nextTime;
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    },
    [isPlaying]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleSplitTrack = useCallback((trackId: string, splitTime: number) => {
    setTracks((prevTracks) => {
      const trackIndex = prevTracks.findIndex((track) => track.id === trackId);
      if (trackIndex === -1) return prevTracks;

      const track = prevTracks[trackIndex];
      const newTrack1 = {
        ...track,
        duration: splitTime - track.startTime,
      };
      const newTrack2 = {
        ...track,
        id: Date.now() + Math.random().toString(),
        startTime: splitTime,
        duration: track.duration - (splitTime - track.startTime),
      };

      return [
        ...prevTracks.slice(0, trackIndex),
        newTrack1,
        newTrack2,
        ...prevTracks.slice(trackIndex + 1),
      ];
    });
  }, []);

  const handleDeleteTrack = useCallback((trackId: string) => {
    setTracks((prevTracks) =>
      prevTracks.filter((track) => track.id !== trackId)
    );
  }, []);

  const handleMoveTrack = useCallback(
    (trackId: string, newStartTime: number, newRow: number) => {
      setTracks((prevTracks) =>
        prevTracks.map((track) =>
          track.id === trackId
            ? { ...track, startTime: newStartTime, row: newRow }
            : track
        )
      );
    },
    []
  );

  return (
    <EditorLayout>
      <TopBar />
      <div
        className="flex flex-1 overflow-hidden"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex">
          <LeftSidebar
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />
          {activePanel && <LeftPanel panelType={activePanel} />}
        </div>
        <main className="flex-grow flex flex-col bg-gray-900">
          <div style={{ height: `${previewHeight}%` }} className="flex-none">
            <VideoPreview
              tracks={tracks}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
          <VerticalResizer onResize={handleResize} />
          <div
            style={{ height: `${100 - previewHeight}%` }}
            className="flex-none overflow-hidden"
          >
            <Timeline
              tracks={tracks}
              onSplitTrack={handleSplitTrack}
              onDeleteTrack={handleDeleteTrack}
              onMoveTrack={handleMoveTrack}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
        </main>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
        accept="audio/*,video/*,image/*"
        multiple
      />
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="text-white text-2xl">Drop files here to upload</div>
        </div>
      )}
    </EditorLayout>
  );
}
