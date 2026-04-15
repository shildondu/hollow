"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip tracking for admin and API routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    const photoId = pathname.startsWith("/photo/")
      ? pathname.split("/photo/")[1]
      : undefined;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || undefined,
        photoId,
      }),
    }).catch(() => {
      // Silently ignore tracking errors
    });
  }, [pathname]);

  return null;
}
