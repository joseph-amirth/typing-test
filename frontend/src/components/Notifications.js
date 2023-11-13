import "./Notifications.css";

const Notification = ({ header, body, type }) => {
  return (
    <div className={`Notification ${type}`}>
      <h3>{header}</h3>
      <p>{body}</p>
    </div>
  );
};

const Notifications = ({ notifications }) => {
  return (
    <div className="Notifications">
      {notifications.map((props) => (
        <Notification {...props} />
      ))}
    </div>
  );
};

export default Notifications;
