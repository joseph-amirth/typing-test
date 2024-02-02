import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VerticalSpacer from "../../common/VerticalSpacer";
import { copyTextToClipboard } from "../../util/misc";
import Buttons from "../Buttons";
import "./SeededTypingTest.css";
import BoundedTypingTest from "../BoundedTypingTest";
import { randomWords } from "../gen";
import { Seed } from "../../util/prng";

const SeededTypingTest = ({
  words,
  length,
  seed,
}: {
  words: string[];
  length: number;
  seed: Seed;
}) => {
  const navigate = useNavigate();
  const [key, setKey] = useState(Date.now());

  const restartTest = () => {
    setKey(Date.now());
  };

  const nextTest = () => {
    navigate("/");
  };

  const shareLinkToTest = () => {
    copyTextToClipboard(window.location.href);
  };

  const test = randomWords(seed, words, length);

  return (
    <div key={key} className="SeededTypingTest">
      <BoundedTypingTest test={test} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default SeededTypingTest;
