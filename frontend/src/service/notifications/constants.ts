import { NotificationProps } from ".";

export const REPEATED_TEST_NOTIFICATION: Omit<NotificationProps, "id"> = {
  type: "Warning",
  title: "Repeated test",
  body: "Test result will not be recorded since the test was repeated",
};
