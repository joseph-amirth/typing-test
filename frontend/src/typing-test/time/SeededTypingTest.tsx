import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VerticalSpacer from "../../component/spacing/VerticalSpacer";
import { copyTextToClipboard } from "../../util/misc";
import Buttons from "./../Buttons";
import "./SeededTypingTest.css";
import TimedTypingTest from "../TimedTypingTest";
import { randomWords } from "../gen";
import { Seed } from "../../util/prng";
import { Language } from "../../service/staticcontent";
import { useLanguage } from "../../service/staticcontent/hooks";

const SeededTypingTest = ({
  language,
  duration,
  seed,
}: {
  language: Language;
  duration: number;
  seed: Seed;
}) => {
  const navigate = useNavigate();
  const words = useLanguage(language);
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

  if (words === undefined) {
    return;
  }

  const generateTest = (count: number) => {
    return randomWords(seed, words, count);
  };

  return (
    <div key={key} className="SeededTypingTest">
      <TimedTypingTest generateTest={generateTest} duration={duration} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default SeededTypingTest;
