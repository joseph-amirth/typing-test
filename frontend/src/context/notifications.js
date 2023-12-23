import { createContext, useState } from "react";

const NOTIFICATION_TIMEOUT = 2 * 1000;

export const NotificationsContext = createContext();

export const useNotificationsContext = () => {
  const [notifications, setNotifications] = useState([]);

  return {
    notifications,
    addNotification: (content) => {
      const id = Date.now();

      setNotifications((notifications) => {
        return [...notifications, { id, type: "info", content }];
      });

      setTimeout(() => {
        setNotifications((notifications) => {
          return notifications.filter((notification) => notification.id !== id);
        });
      }, NOTIFICATION_TIMEOUT);
    },
  };
};
