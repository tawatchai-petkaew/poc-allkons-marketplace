"use client";

// Re-export from the canonical useNotification hook
// All notification functionality now uses App.useApp() internally
export { useNotification } from "@/hooks/useNotification";
export type { INotificationContext } from "@/hooks/useNotification";
