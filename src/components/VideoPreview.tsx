import React, { useRef, useEffect, useState, useCallback } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

interface Track {
  id: string;
  file: File;
  type: "video" | "audio" | "image";
  startTime: number;
  duration: number;
  row: number;
}

interface VideoPreviewProps {
  tracks: Track[];
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
  totalDuration: number;
  onSeeked: (time: number) => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  tracks,
  currentTime,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  totalDuration,
  onSeeked,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [videoObjectURL, setVideoObjectURL] = useState<string | null>(null);
  const seekingRef = useRef(false);

  const videoTrack = tracks.find((track) => track.type === "video");

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
    if (!playerRef.current && videoRef.current && videoObjectURL) {
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

      playerRef.current = videojs(videoRef.current, videoJsOptions, () => {
        console.log("Player is ready");
      });

      playerRef.current.on("timeupdate", () => {
        if (playerRef.current && !seekingRef.current) {
          const newTime =
            (videoTrack?.startTime || 0) + playerRef.current.currentTime();
          onTimeUpdate(newTime);
        }
      });

      playerRef.current.on("seeked", () => {
        if (playerRef.current) {
          const newTime =
            (videoTrack?.startTime || 0) + playerRef.current.currentTime();
          onSeeked(newTime);
          seekingRef.current = false;
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoObjectURL, videoTrack, onTimeUpdate, onSeeked]);

  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (playerRef.current) {
      const targetTime = currentTime - (videoTrack?.startTime || 0);
      if (Math.abs(playerRef.current.currentTime() - targetTime) > 0.5) {
        seekingRef.current = true;
        playerRef.current.currentTime(targetTime);
      }
    }
  }, [currentTime, videoTrack]);

  const handlePlayPause = useCallback(() => {
    onPlayPause();
  }, [onPlayPause]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {videoTrack ? (
        <div style={{ width: "480px", height: "270px" }}>
          <video ref={videoRef} className="video-js" />
        </div>
      ) : (
        <div className="text-white text-2xl">No video track available</div>
      )}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors duration-200 font-semibold"
          onClick={handlePlayPause}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <div className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm font-mono">
        {formatTime(Math.max(0, currentTime))} / {formatTime(totalDuration)}
      </div>
    </div>
  );
};

const formatTime = (time: number): string => {
  if (isNaN(time) || time < 0) {
    return "00:30";
  }
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default VideoPreview;
