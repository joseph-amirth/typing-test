import React, { createContext, useState } from "react";
import Notifications from "../Notifications";

export const NOTIFICATION_TIMEOUT = 10 * 1000;

export type NotificationType = "Info" | "Success" | "Warning" | "Error";

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
}

export const NotificationsContext = createContext<{
  notifications: NotificationProps[];
  addNotification: (
    notificationWithoutId: Omit<NotificationProps, "id">,
  ) => void;
  removeNotification: (id: string) => void;
}>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

export function NotificationsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const removeNotification = (id: string) => {
    setNotifications((notifications) =>
      notifications.filter((notification) => notification.id !== id),
    );
  };

  const notificationsContext = {
    notifications,
    addNotification: ({ type, title, body }: Omit<NotificationProps, "id">) => {
      const id = Math.random().toString();
      const notification: NotificationProps = { id, type, title, body };

      setNotifications((notifications) => {
        return [...notifications, notification];
      });

      setTimeout(() => {
        removeNotification(id);
      }, NOTIFICATION_TIMEOUT);
    },
    removeNotification,
  };

  return (
    <NotificationsContext.Provider value={notificationsContext}>
      <Notifications notifications={notifications} />
      {children}
    </NotificationsContext.Provider>
  );
}
