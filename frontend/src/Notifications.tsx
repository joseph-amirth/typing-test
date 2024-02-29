import { useContext } from "react";
import "./Notifications.css";
import {
  NotificationProps,
  NotificationType,
  NotificationsService,
} from "./service/notifications";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

const Notifications = ({
  notifications,
}: {
  notifications: NotificationProps[];
}) => {
  return (
    <div className="Notifications">
      {notifications.map((props, i) => (
        <Notification key={i} {...props} />
      ))}
    </div>
  );
};

const Notification = ({ id, type, title, body }: NotificationProps) => {
  const { removeNotification } = useContext(NotificationsService);

  return (
    <button className="UnstyledButton" onClick={() => removeNotification(id)}>
      <div className={`Notification ${type}`}>
        <div className="IconAndTitle">
          <Icon type={type} />
          <h2 className="Title">{title}</h2>
        </div>
        <p>{body}</p>
      </div>
    </button>
  );
};

const Icon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "Success":
      return <CheckCircleOutlinedIcon />;
    case "Info":
      return <InfoOutlinedIcon />;
    case "Warning":
      return <WarningAmberOutlinedIcon />;
    case "Error":
      return <ErrorOutlineOutlinedIcon />;
  }
};

export default Notifications;
