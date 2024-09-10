// src/components/VideoPreview.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";

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
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  tracks,
  currentTime,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  totalDuration,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeVideoTrack, setActiveVideoTrack] = useState<Track | null>(null);
  const [activeAudioTrack, setActiveAudioTrack] = useState<Track | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const findActiveTrack = useCallback(
    (type: "video" | "audio") =>
      tracks.find(
        (track) =>
          track.type === type &&
          currentTime >= track.startTime &&
          currentTime < track.startTime + track.duration
      ),
    [tracks, currentTime]
  );

  useEffect(() => {
    const videoTrack = findActiveTrack("video");
    const audioTrack = findActiveTrack("audio");

    setActiveVideoTrack(videoTrack || null);
    setActiveAudioTrack(audioTrack || null);

    if (videoTrack && videoTrack !== activeVideoTrack) {
      const newVideoSrc = URL.createObjectURL(videoTrack.file);
      setVideoSrc(newVideoSrc);
    }

    if (audioTrack && audioTrack !== activeAudioTrack) {
      const newAudioSrc = URL.createObjectURL(audioTrack.file);
      setAudioSrc(newAudioSrc);
    }

    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (audioSrc) URL.revokeObjectURL(audioSrc);
    };
  }, [findActiveTrack, activeVideoTrack, activeAudioTrack]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      video.currentTime = activeVideoTrack
        ? currentTime - activeVideoTrack.startTime
        : 0;
    }

    if (audio) {
      audio.currentTime = activeAudioTrack
        ? currentTime - activeAudioTrack.startTime
        : 0;
    }

    const playMedia = async () => {
      if (isPlaying) {
        if (video && activeVideoTrack) await video.play().catch(console.error);
        if (audio && activeAudioTrack) await audio.play().catch(console.error);
      } else {
        if (video) video.pause();
        if (audio) audio.pause();
      }
    };

    playMedia();
  }, [isPlaying, currentTime, activeVideoTrack, activeAudioTrack]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && activeVideoTrack) {
      const newTime = activeVideoTrack.startTime + videoRef.current.currentTime;
      onTimeUpdate(newTime);
    } else if (audioRef.current && activeAudioTrack) {
      const newTime = activeAudioTrack.startTime + audioRef.current.currentTime;
      onTimeUpdate(newTime);
    }
  }, [activeVideoTrack, activeAudioTrack, onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) video.addEventListener("timeupdate", handleTimeUpdate);
    if (audio) audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      if (video) video.removeEventListener("timeupdate", handleTimeUpdate);
      if (audio) audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [handleTimeUpdate]);

  return (
    <div className="relative w-full h-full bg-gray-900 flex items-center justify-center overflow-hidden">
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute top-0 left-0 w-full h-full object-contain"
          playsInline
        />
      )}
      {audioSrc && <audio ref={audioRef} src={audioSrc} />}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors duration-200 font-semibold"
          onClick={onPlayPause}
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
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default VideoPreview;
