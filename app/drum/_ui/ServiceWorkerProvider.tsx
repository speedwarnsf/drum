"use client";

import { useServiceWorker } from "../_lib/useServiceWorker";

export default function ServiceWorkerProvider() {
  useServiceWorker();
  return null;
}
