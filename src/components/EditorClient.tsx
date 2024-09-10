// src/components/EditorClient.tsx
"use client";

import React, { useState } from "react";
import Timeline from "@/components/Timeline";
import VideoPreview from "@/components/VideoPreview";

export default function EditorClient({ initialTracks }) {
  const [tracks, setTracks] = useState(initialTracks);

  const onDragEnd = (result) => {
    // Implement drag and drop logic here
  };

  return (
    <div className="flex">
      <div className="w-2/3 pr-4">
        <VideoPreview />
      </div>
      <div className="w-1/3">
        <Timeline tracks={tracks} onDragEnd={onDragEnd} />
      </div>
    </div>
  );
}
