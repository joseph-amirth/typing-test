import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { copyTextToClipboard } from "../../utils/misc";
import Buttons from "../Buttons";
import SeededTypingTest from "./SeededTypingTest";
import "./SpecificTypingTest.css";

const SpecificTypingTest = (props) => {
  const navigate = useNavigate();

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
      <SeededTypingTest {...props} />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default SpecificTypingTest;
