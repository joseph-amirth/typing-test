import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { copyTextToClipboard } from "../../util/misc";
import BoundedTypingTest from "../BoundedTypingTest";
import Buttons from "./../Buttons";

const SpecificTypingTest = () => {
  const navigate = useNavigate();
  const { quote } = useLoaderData();

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
      <BoundedTypingTest test={quote.split(" ")} />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default SpecificTypingTest;
