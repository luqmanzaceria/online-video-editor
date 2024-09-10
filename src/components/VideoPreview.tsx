// src/components/VideoPreview.tsx
import React, { useRef, useEffect, useState } from "react";

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
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  tracks,
  currentTime,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeVideoTrack, setActiveVideoTrack] = useState<Track | null>(null);
  const [activeAudioTrack, setActiveAudioTrack] = useState<Track | null>(null);

  useEffect(() => {
    const newActiveVideoTrack = tracks.find(
      (track) =>
        track.type === "video" &&
        currentTime >= track.startTime &&
        currentTime < track.startTime + track.duration
    );
    setActiveVideoTrack(newActiveVideoTrack || null);

    const newActiveAudioTrack = tracks.find(
      (track) =>
        track.type === "audio" &&
        currentTime >= track.startTime &&
        currentTime < track.startTime + track.duration
    );
    setActiveAudioTrack(newActiveAudioTrack || null);
  }, [tracks, currentTime]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current && activeVideoTrack) {
      videoRef.current.src = URL.createObjectURL(activeVideoTrack.file);
      videoRef.current.currentTime = currentTime - activeVideoTrack.startTime;
    }
    if (audioRef.current && activeAudioTrack) {
      audioRef.current.src = URL.createObjectURL(activeAudioTrack.file);
      audioRef.current.currentTime = currentTime - activeAudioTrack.startTime;
    }
  }, [activeVideoTrack, activeAudioTrack, currentTime]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const newTime = activeVideoTrack
        ? activeVideoTrack.startTime + videoRef.current.currentTime
        : currentTime;
      onTimeUpdate(newTime);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {activeVideoTrack ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          width={1920}
          height={1080}
        />
      )}
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full"
          onClick={onPlayPause}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <div className="absolute bottom-4 right-4 text-white">
        {formatTime(currentTime)} / 30:00
      </div>
    </div>
  );
};

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default VideoPreview;
