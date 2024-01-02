import { useLoaderData } from "react-router-dom";
import VerticalSpacer from "../common/VerticalSpacer";

import "./Results.css";

const Results = () => {
  const params = useLoaderData();
  const { error } = params;

  return (
    <div className="Results">
      {error === undefined &&
        params.map((result, i) => <Result key={i} {...result} />)}
      {error !== undefined && <span className="Error">{error}</span>}
    </div>
  );
};

const Result = ({
  testParams,
  testCompletedTimestamp,
  wpm,
  rawWpm,
  accuracy,
}) => {
  const { mode, params } = testParams;
  const datetime = new Date(testCompletedTimestamp * 1000);

  return (
    <>
      <div className="Result">
        <TypingTestParams mode={mode} params={Object.entries(params)} />
        <Stat name="WPM" value={wpm.toString()} />
        <Stat name="Accuracy" value={accuracy + "%"} />
        <Stat name="Raw WPM" value={rawWpm.toString()} />
        <Stat
          name="Timestamp"
          value={
            datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString()
          }
        />
      </div>
      <VerticalSpacer />
    </>
  );
};

const TypingTestParams = ({ mode, params }) => {
  return (
    <div className="TypingTestParams">
      <div className="Mode">{mode}</div>
      <div className="Params">
        {params.map(([key, value], i) => (
          <div key={i} className="Param">
            {key} {value}
          </div>
        ))}
      </div>
    </div>
  );
};

const Stat = ({ name, value }) => {
  return (
    <div className="Stat">
      <div className="Name">{name}</div>
      <div className="Value">{value}</div>
    </div>
  );
};

export default Results;
