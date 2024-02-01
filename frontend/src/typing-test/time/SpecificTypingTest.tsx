import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VerticalSpacer from "../../common/VerticalSpacer";
import { copyTextToClipboard } from "../../util/misc";
import Buttons from "./../Buttons";
import "./SpecificTypingTest.css";
import TimedTypingTest from "../TimedTypingTest";
import { importLanguage, randomWords } from "../gen";
import { base64urlToSeed } from "../../util/prng";
import { Language } from "../gen";

const SpecificTypingTest = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [words, setWords] = useState<string[] | undefined>(undefined);
  const [key, setKey] = useState(Date.now());

  const seed = base64urlToSeed(params.base64urlSeed!);
  const language = params.language as Language;
  const duration = parseInt(params.duration!);

  useEffect(() => {
    importLanguage(language).then(setWords);
  }, []);

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
    return <div className="Loading"></div>;
  }

  const generateTest = (count: number) => {
    return randomWords(seed, words, count);
  };

  return (
    <div key={key} className="SpecificTypingTest">
      <TimedTypingTest generateTest={generateTest} duration={duration} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default SpecificTypingTest;
