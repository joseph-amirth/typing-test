import { createContext, useState } from "react";

const NOTIFICATION_TIMEOUT = 2 * 1000;

export const NotificationsContext = createContext({
  notifications: [],
  addInfoNotification: () => {
    throw new Error("Not implemented");
  },
});

export const useNotificationsContext = () => {
  const [notifications, setNotifications] = useState([]);

  return {
    notifications,
    addNotification: (props) => {
      const id = Date.now();

      setNotifications((notifications) => {
        return [...notifications, { ...props, type: "Info", id }];
      });

      setTimeout(() => {
        setNotifications((notifications) => {
          return notifications.filter((notification) => notification.id !== id);
        });
      }, NOTIFICATION_TIMEOUT);
    },
  };
};
