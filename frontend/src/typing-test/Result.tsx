import "./Result.css";
import { Stats } from "./stat";

const Result = ({ wpm, rawWpm, accuracy }: Stats) => {
  return (
    <div className="Result">
      <Stat name="WPM" value={wpm} />
      <Stat name="Accuracy" value={accuracy} />
      <Stat name="Raw WPM" value={rawWpm} />
    </div>
  );
};

const Stat = ({ name, value }: { name: string; value: number }) => {
  return (
    <div className="Stat">
      <div className="Name">{name}</div>
      <div className="Value">{value}</div>
    </div>
  );
};

export default Result;
