import { createService } from "..";

export type NotificationType = "Info" | "Success" | "Warning" | "Error";

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
}

export const NotificationsService = createService<{
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
