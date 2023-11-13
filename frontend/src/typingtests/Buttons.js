import HorizontalSpacer from "../components/HorizontalSpacer";
import "./Buttons.css";

const Buttons = ({ restart, next, share }) => {
  return (
    <div className="Buttons">
      <Button label="Restart" onClick={restart} />
      <HorizontalSpacer />
      <Button label="Next test" onClick={next} />
      <HorizontalSpacer />
      <Button label="Share link" onClick={share} />
    </div>
  );
};

const Button = ({ label, onClick }) => {
  return (
    <button className="Button" onClick={onClick}>
      {label}
    </button>
  );
};

export default Buttons;
