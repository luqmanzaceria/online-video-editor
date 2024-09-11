// src/context/TimelineContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from "react";

export interface Track {
  id: string;
  file: File;
  type: "video" | "audio" | "image";
  startTime: number;
  duration: number;
  row: number;
}

interface TimelineState {
  tracks: Track[];
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
}

type TimelineAction =
  | { type: "ADD_TRACK"; payload: Track }
  | { type: "UPDATE_TRACK"; payload: Track }
  | { type: "DELETE_TRACK"; payload: string }
  | { type: "SPLIT_TRACK"; payload: { trackId: string; splitTime: number } }
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_IS_PLAYING"; payload: boolean }
  | { type: "SET_TOTAL_DURATION"; payload: number };

const initialState: TimelineState = {
  tracks: [],
  currentTime: 0,
  isPlaying: false,
  totalDuration: 30,
};

function timelineReducer(
  state: TimelineState,
  action: TimelineAction
): TimelineState {
  switch (action.type) {
    case "ADD_TRACK":
      return { ...state, tracks: [...state.tracks, action.payload] };
    case "UPDATE_TRACK":
      return {
        ...state,
        tracks: state.tracks.map((track) =>
          track.id === action.payload.id ? action.payload : track
        ),
      };
    case "DELETE_TRACK":
      return {
        ...state,
        tracks: state.tracks.filter((track) => track.id !== action.payload),
      };
    case "SPLIT_TRACK":
      const { trackId, splitTime } = action.payload;
      const trackToSplit = state.tracks.find((track) => track.id === trackId);
      if (!trackToSplit) return state;

      const newTrack1 = {
        ...trackToSplit,
        duration: splitTime - trackToSplit.startTime,
      };
      const newTrack2 = {
        ...trackToSplit,
        id: Date.now() + Math.random().toString(),
        startTime: splitTime,
        duration: trackToSplit.duration - (splitTime - trackToSplit.startTime),
      };

      return {
        ...state,
        tracks: [
          ...state.tracks.filter((track) => track.id !== trackId),
          newTrack1,
          newTrack2,
        ],
      };
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };
    case "SET_IS_PLAYING":
      return { ...state, isPlaying: action.payload };
    case "SET_TOTAL_DURATION":
      return { ...state, totalDuration: action.payload };
    default:
      return state;
  }
}

const TimelineContext = createContext<
  | {
      state: TimelineState;
      dispatch: React.Dispatch<TimelineAction>;
    }
  | undefined
>(undefined);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timelineReducer, initialState);

  return (
    <TimelineContext.Provider value={{ state, dispatch }}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
}

// Make sure to export the TimelineContext
export { TimelineContext };
