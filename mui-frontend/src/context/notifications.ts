import { createContext, useState } from "react";

const NOTIFICATION_TIMEOUT = 2 * 1000;

export interface NotificationProps {
  id: number;
  type: "info" | "success" | "warning" | "error";
  content: string;
}

export const NotificationsContext = createContext<{
  notifications: NotificationProps[];
  addNotification: (notificationProps: NotificationProps) => void;
}>({
  notifications: [],
  addNotification: () => {},
});

export const useNotificationsContext = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  return {
    notifications,
    addNotification: (notification: NotificationProps) => {
      const id = Date.now();

      setNotifications((notifications) => {
        return [...notifications, notification];
      });

      setTimeout(() => {
        setNotifications((notifications) => {
          return notifications.filter((notification) => notification.id !== id);
        });
      }, NOTIFICATION_TIMEOUT);
    },
  };
};
