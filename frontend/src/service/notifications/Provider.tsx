import { useState } from "react";
import { NotificationProps, NotificationsService } from ".";
import Notifications from "../../Notifications";

export const NOTIFICATION_TIMEOUT = 10 * 1000;

export function NotificationsServiceProvider({
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

  const notificationsService = {
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
    <NotificationsService.Provider value={notificationsService}>
      <Notifications notifications={notifications} />
      {children}
    </NotificationsService.Provider>
  );
}
