import React, { useRef, useEffect, useState, useCallback } from "react";
import { useTimeline } from "@/context/TimelineContext";

const VideoPreview: React.FC = () => {
  const { state, dispatch } = useTimeline();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [videoDimensions, setVideoDimensions] = useState({
    width: 480,
    height: 270,
  });

  useEffect(() => {
    const videoTracks = state.tracks.filter((track) => track.type === "video");
    const audioTracks = state.tracks.filter((track) => track.type === "audio");

    // Create or update video elements
    videoTracks.forEach((track) => {
      if (!videoRefs.current[track.id]) {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(track.file);
        video.style.position = "absolute";
        video.style.top = "0";
        video.style.left = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "contain";
        video.muted = true;
        videoRefs.current[track.id] = video;
        containerRef.current?.appendChild(video);
      }
    });

    // Create or update audio elements
    audioTracks.forEach((track) => {
      if (!audioRefs.current[track.id]) {
        const audio = document.createElement("audio");
        audio.src = URL.createObjectURL(track.file);
        audioRefs.current[track.id] = audio;
      }
    });

    // Remove unused video and audio elements
    Object.keys(videoRefs.current).forEach((id) => {
      if (!videoTracks.find((track) => track.id === id)) {
        videoRefs.current[id].remove();
        delete videoRefs.current[id];
      }
    });

    Object.keys(audioRefs.current).forEach((id) => {
      if (!audioTracks.find((track) => track.id === id)) {
        delete audioRefs.current[id];
      }
    });

    // Set video dimensions based on the first video track
    if (videoTracks.length > 0) {
      const video = videoRefs.current[videoTracks[0].id];
      video.onloadedmetadata = () => {
        setVideoDimensions({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
    }
  }, [state.tracks]);

  useEffect(() => {
    const updateMediaElements = () => {
      let activeVideoFound = false;

      state.tracks.forEach((track) => {
        const media =
          track.type === "video"
            ? videoRefs.current[track.id]
            : audioRefs.current[track.id];
        if (media) {
          const trackStart = track.startTime;
          const trackEnd = track.startTime + track.duration;

          if (state.currentTime >= trackStart && state.currentTime < trackEnd) {
            if (track.type === "video") {
              media.style.display = "block";
              activeVideoFound = true;
            }
            media.currentTime = state.currentTime - trackStart;
            if (state.isPlaying && media.paused) {
              media.play();
            } else if (!state.isPlaying && !media.paused) {
              media.pause();
            }
          } else {
            if (track.type === "video") {
              media.style.display = "none";
            }
            media.pause();
          }
        }
      });

      // If no active video is found, ensure the container is black
      if (!activeVideoFound && containerRef.current) {
        containerRef.current.style.backgroundColor = "black";
      } else if (containerRef.current) {
        containerRef.current.style.backgroundColor = "transparent";
      }
    };

    updateMediaElements();

    const interval = setInterval(() => {
      if (state.isPlaying) {
        dispatch({
          type: "SET_CURRENT_TIME",
          payload: Math.min(state.currentTime + 0.1, state.totalDuration),
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    state.currentTime,
    state.isPlaying,
    state.tracks,
    state.totalDuration,
    dispatch,
  ]);

  const handlePlayPause = useCallback(() => {
    dispatch({ type: "SET_IS_PLAYING", payload: !state.isPlaying });
  }, [dispatch, state.isPlaying]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        style={{
          width: `${videoDimensions.width}px`,
          height: `${videoDimensions.height}px`,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors duration-200 font-semibold"
          onClick={handlePlayPause}
        >
          {state.isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <div className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm font-mono">
        {formatTime(Math.max(0, state.currentTime))} /{" "}
        {formatTime(state.totalDuration)}
      </div>
    </div>
  );
};

const formatTime = (time: number): string => {
  if (isNaN(time) || time < 0) {
    return "00:00";
  }
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default VideoPreview;
