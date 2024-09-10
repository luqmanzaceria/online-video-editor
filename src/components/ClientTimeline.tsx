// src/components/ClientTimeline.tsx
"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const ClientTimeline = ({ tracks: initialTracks }) => {
  const [tracks, setTracks] = useState(initialTracks);

  const onDragEnd = (result) => {
    // Implement drag and drop logic here
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="timeline">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {tracks.map((track, index) => (
              <Draggable key={track.id} draggableId={track.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-2 mb-2 rounded shadow"
                  >
                    {track.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ClientTimeline;
