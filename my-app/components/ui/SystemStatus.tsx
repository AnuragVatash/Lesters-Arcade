"use client";

import { useState, useEffect } from "react";

export default function SystemStatus() {
  const [buildTime, setBuildTime] = useState<string>("");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set build time (you can replace this with actual build timestamp)
    setBuildTime(new Date().toISOString().split("T")[0]);

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 border border-green-500/30 rounded-md px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-400" : "bg-red-400"
            } animate-pulse`}
          ></div>
          <span className="text-green-400">
            {isOnline ? "ONLINE" : "OFFLINE"} | BUILD {buildTime}
          </span>
        </div>
      </div>
    </div>
  );
}
