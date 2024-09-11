// src/components/VideoPreview.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import { useTimeline } from "@/context/TimelineContext";

const VideoPreview: React.FC = () => {
  const { state, dispatch } = useTimeline();
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [videoObjectURL, setVideoObjectURL] = useState<string | null>(null);
  const seekingRef = useRef(false);

  const videoTrack = state.tracks.find((track) => track.type === "video");

  useEffect(() => {
    if (videoTrack) {
      const newVideoURL = URL.createObjectURL(videoTrack.file);
      setVideoObjectURL(newVideoURL);
      return () => {
        URL.revokeObjectURL(newVideoURL);
      };
    } else {
      setVideoObjectURL(null);
    }
  }, [videoTrack]);

  useEffect(() => {
    if (!videoRef.current) return;

    // Clean up previous player instance
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    if (videoObjectURL) {
      // Create video element
      const videoElement = document.createElement("video");
      videoElement.className = "video-js vjs-big-play-centered";
      videoRef.current.appendChild(videoElement);

      const videoJsOptions = {
        controls: false,
        autoplay: false,
        preload: "auto",
        responsive: false,
        fluid: false,
        width: 480,
        height: 270,
        sources: [
          {
            src: videoObjectURL,
            type: videoTrack?.file.type || "video/mp4",
          },
        ],
      };

      playerRef.current = videojs(videoElement, videoJsOptions);

      playerRef.current.ready(() => {
        if (playerRef.current) {
          playerRef.current.on("timeupdate", () => {
            if (!seekingRef.current) {
              const newTime =
                (videoTrack?.startTime || 0) + playerRef.current!.currentTime();
              dispatch({ type: "SET_CURRENT_TIME", payload: newTime });
            }
          });

          playerRef.current.on("seeked", () => {
            const newTime =
              (videoTrack?.startTime || 0) + playerRef.current!.currentTime();
            dispatch({ type: "SET_CURRENT_TIME", payload: newTime });
            seekingRef.current = false;
          });
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoObjectURL, videoTrack, dispatch]);

  useEffect(() => {
    if (playerRef.current) {
      if (state.isPlaying) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  }, [state.isPlaying]);

  useEffect(() => {
    if (playerRef.current && videoTrack) {
      const targetTime = state.currentTime - videoTrack.startTime;
      if (Math.abs(playerRef.current.currentTime() - targetTime) > 0.5) {
        seekingRef.current = true;
        playerRef.current.currentTime(targetTime);
      }
    }
  }, [state.currentTime, videoTrack]);

  const handlePlayPause = useCallback(() => {
    dispatch({ type: "SET_IS_PLAYING", payload: !state.isPlaying });
  }, [dispatch, state.isPlaying]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <div ref={videoRef} style={{ width: "480px", height: "270px" }} />
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
