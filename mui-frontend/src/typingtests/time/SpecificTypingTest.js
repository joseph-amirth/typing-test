import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VerticalSpacer from "../../common/VerticalSpacer";
import { copyTextToClipboard } from "../../util/misc";
import Buttons from "./../Buttons";
import SeededTypingTest from "./SeededTypingTest";
import "./SpecificTypingTest.css";

const SpecificTypingTest = () => {
  const navigate = useNavigate();
  const params = useParams();
  params.duration = parseInt(params.duration);
  params.seed = parseInt(params.seed);

  const [key, setKey] = useState("");

  const restartTest = () => {
    setKey(Date.now());
  };

  const nextTest = () => {
    navigate("/");
  };

  const shareLinkToTest = () => {
    copyTextToClipboard(window.location.href);
  };

  return (
    <div key={key} className="SpecificTypingTest">
      <SeededTypingTest {...params} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default SpecificTypingTest;
