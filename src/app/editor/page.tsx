// src/app/editor/page.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { TimelineProvider, useTimeline } from "@/context/TimelineContext";
import EditorLayout from "@/components/EditorLayout";
import VideoPreview from "@/components/VideoPreview";
import Timeline from "@/components/Timeline";
import LeftSidebar from "@/components/LeftSidebar";
import LeftPanel from "@/components/LeftPanel";
import TopBar from "@/components/TopBar";
import VerticalResizer from "@/components/VerticalResizer";

function EditorContent() {
  const { state, dispatch } = useTimeline();
  const [activePanel, setActivePanel] = useState(null);
  const [previewHeight, setPreviewHeight] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

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

  const getMediaDuration = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image")) {
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

  const addNewTracks = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter(
        (file) =>
          file.type.startsWith("audio/") ||
          file.type.startsWith("video/") ||
          file.type.startsWith("image/")
      );

      let maxRow = Math.max(...state.tracks.map((track) => track.row), -1);

      for (const file of validFiles) {
        const duration = await getMediaDuration(file);

        if (file.type.startsWith("video/")) {
          maxRow++;
          dispatch({
            type: "ADD_TRACK",
            payload: {
              id: Date.now() + Math.random().toString(),
              file,
              type: "video",
              startTime: 0,
              duration,
              row: maxRow,
            },
          });

          maxRow++;
          dispatch({
            type: "ADD_TRACK",
            payload: {
              id: Date.now() + Math.random().toString(),
              file,
              type: "audio",
              startTime: 0,
              duration,
              row: maxRow,
            },
          });
        } else if (file.type.startsWith("audio/")) {
          maxRow++;
          dispatch({
            type: "ADD_TRACK",
            payload: {
              id: Date.now() + Math.random().toString(),
              file,
              type: "audio",
              startTime: 0,
              duration,
              row: maxRow,
            },
          });
        } else if (file.type.startsWith("image/")) {
          maxRow++;
          dispatch({
            type: "ADD_TRACK",
            payload: {
              id: Date.now() + Math.random().toString(),
              file,
              type: "image",
              startTime: 0,
              duration: 5, // Fixed duration for images
              row: maxRow,
            },
          });
        }
      }

      const maxDuration = Math.max(
        ...state.tracks.map((track) => track.startTime + track.duration),
        30
      );
      dispatch({ type: "SET_TOTAL_DURATION", payload: maxDuration });
    },
    [state.tracks, dispatch]
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
    dispatch({ type: "SET_IS_PLAYING", payload: !state.isPlaying });
  }, [state.isPlaying, dispatch]);

  const handleTimeUpdate = useCallback(
    (time: number) => {
      dispatch({
        type: "SET_CURRENT_TIME",
        payload: Math.max(0, Math.min(time, state.totalDuration)),
      });
    },
    [state.totalDuration, dispatch]
  );

  return (
    <>
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
            <VideoPreview />
          </div>
          <VerticalResizer onResize={handleResize} />
          <div
            style={{ height: `${100 - previewHeight}%` }}
            className="flex-none overflow-hidden"
          >
            <Timeline />
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
    </>
  );
}

export default function Editor() {
  return (
    <TimelineProvider>
      <EditorLayout>
        <EditorContent />
      </EditorLayout>
    </TimelineProvider>
  );
}
