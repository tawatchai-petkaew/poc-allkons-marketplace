"use client";

import { App } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";

export type INotificationContext = {
  notification: NotificationInstance;
};

/**
 * useNotification hook that uses App.useApp() internally.
 * This ensures notifications render inside antd's <App> component,
 * so CSS-in-JS styles are properly collected by AntdRegistry during SSR.
 *
 * No separate NotificationProvider is needed — just wrap your app with <App>.
 */
export const useNotification = (): INotificationContext => {
  const { notification: api } = App.useApp();

  // 👇 Wrapper for success with custom class
  const success: NotificationInstance["success"] = (args) =>
    api.success({
      placement: "top",
      ...args,
      className: `custom-success-notification ${args.className || ""}`,
    });

  // 👇 Wrapper for error with custom class
  const error: NotificationInstance["error"] = (args) =>
    api.error({
      placement: "top",
      ...args,
      className: `custom-error-notification ${args.className || ""}`,
    });

  const wrappedApi: NotificationInstance = {
    ...api,
    success,
    error,
  };

  return { notification: wrappedApi };
};
