import "./Notifications.css";

const Notification = ({ type, content }) => {
  return (
    <div className={`Notification ${type}`}>
      <h3>{content}</h3>
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
