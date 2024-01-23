import "./Notifications.css";
import { NotificationProps } from "./context/notifications";

const Notification = ({ type, content }: NotificationProps) => {
  return (
    <div className={`Notification ${type}`}>
      <h3>{content}</h3>
    </div>
  );
};

const Notifications = ({
  notifications,
}: {
  notifications: NotificationProps[];
}) => {
  return (
    <div className="Notifications">
      {notifications.map((props) => (
        <Notification {...props} />
      ))}
    </div>
  );
};

export default Notifications;
