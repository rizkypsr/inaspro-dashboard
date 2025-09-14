"use client";

import React from "react";

import EventsTab from "./components/events-tab";
import { EventProvider } from "./context/event-context";

import { ProtectedRoute } from "@/components/protected-route";

export default function FantasyPage() {
  return (
    <ProtectedRoute>
      <EventProvider>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fantasy Events
            </h1>
          </div>

          <EventsTab />
        </div>
      </EventProvider>
    </ProtectedRoute>
  );
}
