import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VerticalSpacer from "../../common/VerticalSpacer";
import { copyTextToClipboard } from "../../util/misc";
import Buttons from "../Buttons";
import "./SpecificTypingTest.css";
import BoundedTypingTest from "../BoundedTypingTest";
import { Language, importLanguage, randomWords } from "../gen";
import { base64urlToSeed } from "../../util/prng";

const SpecificTypingTest = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [words, setWords] = useState<string[] | undefined>(undefined);
  const [key, setKey] = useState(Date.now());

  const seed = base64urlToSeed(params.base64urlSeed!);
  const language = params.language as Language;
  const length = parseInt(params.length!);

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

  const test = randomWords(seed, words, length);

  return (
    <div key={key} className="SpecificTypingTest">
      <BoundedTypingTest test={test} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default SpecificTypingTest;
