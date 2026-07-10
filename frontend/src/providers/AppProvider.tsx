"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLessonStore } from "@/store/useLessonStore";

import { getApiUrl } from "@/utils/api";

const queryClient = new QueryClient();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setStats = useLessonStore((state) => state.setStats);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/v1/me`, {
          headers: { "X-User-Id": "1" }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load user stats:", err);
      }
    };
    loadStats();
  }, [setStats]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
