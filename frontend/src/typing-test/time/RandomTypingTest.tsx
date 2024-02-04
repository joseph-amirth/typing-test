import { useState } from "react";
import { generateSeed, seedToBase64url } from "../../util/prng";
import Buttons from "../Buttons";
import "./RandomTypingTest.css";
import VerticalSpacer from "../../common/VerticalSpacer";
import { randomWords } from "../gen";
import TimedTypingTest from "../TimedTypingTest";
import { Language, useLanguage } from "../../service/static-content";
import { copyTextToClipboard } from "../../util/misc";

const RandomTypingTest = ({
  language,
  duration,
}: {
  language: Language;
  duration: number;
}) => {
  const words = useLanguage(language);
  const [seed, setSeed] = useState(generateSeed());
  const [key, setKey] = useState(Date.now());

  const nextTest = () => {
    let newSeed = generateSeed();
    while (newSeed === seed) {
      newSeed = generateSeed();
    }
    setSeed(newSeed);
    setKey(Date.now());
  };

  const restartTest = () => {
    setKey(Date.now());
  };

  const shareLinkToTest = () => {
    copyTextToClipboard(
      `${window.location.origin}/time/${language}/${duration}/${seedToBase64url(
        seed,
      )}`,
    );
  };

  if (words === undefined) {
    return;
  }

  const generateTest = (count: number) => {
    return randomWords(seed, words, count);
  };

  return (
    <div className="RandomTypingTest">
      <TimedTypingTest
        key={key}
        generateTest={generateTest}
        duration={duration}
      />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default RandomTypingTest;
