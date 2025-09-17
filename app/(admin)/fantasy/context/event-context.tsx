"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxTeams: number;
  registrationFee: number;
  status: "draft" | "published" | "ongoing" | "completed";
  international: boolean;
}

interface EventContextType {
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  events: Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Mock events data
const mockEvents: Event[] = [
  {
    id: "1",
    name: "Summer Championship 2024",
    description: "Annual summer football championship",
    startDate: "2024-07-15",
    endDate: "2024-07-30",
    location: "Jakarta Stadium",
    maxTeams: 16,
    registrationFee: 500000,
    status: "published",
    international: false,
  },
  {
    id: "2",
    name: "International Cup 2024",
    description: "International football tournament",
    startDate: "2024-08-10",
    endDate: "2024-08-25",
    location: "Bali Sports Complex",
    maxTeams: 32,
    registrationFee: 1000000,
    status: "ongoing",
    international: true,
  },
  {
    id: "3",
    name: "Youth League 2024",
    description: "Youth football league for under 18",
    startDate: "2024-09-01",
    endDate: "2024-09-15",
    location: "Surabaya Arena",
    maxTeams: 12,
    registrationFee: 300000,
    status: "draft",
    international: false,
  },
];

export function EventProvider({ children }: { children: ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <EventContext.Provider
      value={{
        selectedEvent,
        setSelectedEvent,
        events: mockEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);

  if (context === undefined) {
    throw new Error("useEventContext must be used within an EventProvider");
  }

  return context;
}

export type { Event };
