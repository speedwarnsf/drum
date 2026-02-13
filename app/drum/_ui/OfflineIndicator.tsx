"use client";

import React, { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" briefly
      if (wasOffline) {
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className = "" }: OfflineIndicatorProps) {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={`offline-indicator ${isOnline ? "offline-indicator-restored" : ""} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="offline-indicator-icon">
        {isOnline ? "✓" : "--"}
      </span>
      <span className="offline-indicator-text">
        {isOnline
          ? "Back online"
          : "You're offline — practice data saves locally"}
      </span>
    </div>
  );
}

// Compact version for header/nav
export function OfflineBadge() {
  const { isOnline } = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <span className="offline-badge" title="Working offline">
      Offline
    </span>
  );
}

// Hook for components that need to know about offline state
export function useOfflineQueue() {
  const { isOnline } = useOnlineStatus();
  const [queue, setQueue] = useState<Array<() => Promise<void>>>([]);

  // Process queue when back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const processQueue = async () => {
        const actions = [...queue];
        setQueue([]);
        
        for (const action of actions) {
          try {
            await action();
          } catch (error) {
            console.error("[Offline Queue] Failed to process action:", error);
          }
        }
      };

      processQueue();
    }
  }, [isOnline, queue]);

  const queueAction = (action: () => Promise<void>) => {
    if (isOnline) {
      // Execute immediately if online
      action().catch(console.error);
    } else {
      // Queue for later
      setQueue((prev) => [...prev, action]);
    }
  };

  return { isOnline, queueAction, queueLength: queue.length };
}

export default OfflineIndicator;
