import { notification as antNotification } from 'antd';
import {
  NotificationInstance,
  ArgsProps,
} from 'antd/es/notification/interface';
import { createContext, ReactNode } from 'react';

export type INotificationContext = {
  notification: NotificationInstance;
};

type NotificationProviderProps = {
  children: ReactNode;
};

export const NotificationContext = createContext<INotificationContext>({
  notification: {
    success: () => {},
    error: () => {},
    info: () => {},
    warning: () => {},
    open: () => {},
    destroy: () => {},
  },
});

const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [api, contextHolder] = antNotification.useNotification({
    placement: 'top',
  });

  // 👇 Wrapper สำหรับ success
  const success: NotificationInstance['success'] = (args) =>
    api.success({
      ...args,
      className: `custom-success-notification ${args.className || ''}`,
    });

  // 👇 ทำได้กับ error/info/warning ด้วยถ้าต้องการ
  const error: NotificationInstance['error'] = (args) =>
    api.error({
      ...args,
      className: `custom-error-notification ${args.className || ''}`,
    });

  const wrappedApi: NotificationInstance = {
    ...api,
    success,
    error,
  };

  return (
    <NotificationContext.Provider value={{ notification: wrappedApi }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
