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
  const lastUpdateTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const [totalDuration, setTotalDuration] = useState(30);

  useEffect(() => {
    const maxDuration = Math.max(
      ...tracks.map((track) => track.startTime + track.duration),
      30
    );
    setTotalDuration(maxDuration);
  }, [tracks]);

  const getMediaDuration = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image")) {
        // For images, we can set a default duration
        resolve(5); // 5 seconds default for images
      } else {
        const element = file.type.startsWith("video")
          ? document.createElement("video")
          : document.createElement("audio");
        element.preload = "metadata";
        element.onloadedmetadata = () => resolve(element.duration);
        element.onerror = () => resolve(10); // Default to 10 seconds if there's an error
        element.src = URL.createObjectURL(file);
      }
    });
  };

  const handleResize = useCallback((deltaY: number) => {
    setPreviewHeight((prevHeight) => {
      const newHeight = prevHeight + (deltaY / window.innerHeight) * 100;
      return Math.max(20, Math.min(80, newHeight)); // Limit between 20% and 80%
    });
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget === editorRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const addNewTracks = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter(
        (file) =>
          file.type.startsWith("audio/") ||
          file.type.startsWith("video/") ||
          file.type.startsWith("image/")
      );

      const newTracks: Track[] = [];
      let maxRow = Math.max(...tracks.map((track) => track.row), -1);

      for (const file of validFiles) {
        const duration = await getMediaDuration(file);

        if (file.type.startsWith("video/")) {
          maxRow++;
          newTracks.push({
            id: Date.now() + Math.random().toString(),
            file,
            type: "video",
            startTime: 0,
            duration,
            row: maxRow,
          });

          maxRow++;
          newTracks.push({
            id: Date.now() + Math.random().toString(),
            file,
            type: "audio",
            startTime: 0,
            duration,
            row: maxRow,
          });
        } else if (file.type.startsWith("audio/")) {
          maxRow++;
          newTracks.push({
            id: Date.now() + Math.random().toString(),
            file,
            type: "audio",
            startTime: 0,
            duration,
            row: maxRow,
          });
        } else if (file.type.startsWith("image/")) {
          maxRow++;
          newTracks.push({
            id: Date.now() + Math.random().toString(),
            file,
            type: "image",
            startTime: 0,
            duration: 5, // Fixed duration for images
            row: maxRow,
          });
        }
      }

      setTracks((prevTracks) => [...prevTracks, ...newTracks]);
    },
    [tracks, getMediaDuration]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      const droppedFiles = Array.from(event.dataTransfer.files);
      addNewTracks(droppedFiles);
    },
    [addNewTracks]
  );

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
        if (lastUpdateTimeRef.current === 0) {
          lastUpdateTimeRef.current = time;
        }
        const deltaTime = (time - lastUpdateTimeRef.current) / 1000;
        lastUpdateTimeRef.current = time;

        setCurrentTime((prevTime) => {
          const nextTime = prevTime + deltaTime;
          return nextTime >= totalDuration ? 0 : nextTime;
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    },
    [isPlaying, totalDuration]
  );

  useEffect(() => {
    lastUpdateTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, 30))); // Ensure time is between 0 and 30
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
        ref={editorRef}
        className="flex flex-1 overflow-hidden bg-gray-900"
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
        <main className="flex-grow flex flex-col">
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
              totalDuration={totalDuration}
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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50 pointer-events-none">
          <div className="text-white text-2xl border-2 border-dashed border-white p-8 rounded-lg">
            Drop files here to upload
          </div>
        </div>
      )}
    </EditorLayout>
  );
}
