import { useEffect, useState } from "react";
import { copyTextToClipboard } from "../../util/misc";
import { generateSeed, seedToBase64url } from "../../util/prng";
import Buttons from "../Buttons";
import "./RandomTypingTest.css";
import VerticalSpacer from "../../common/VerticalSpacer";
import { importLanguage, randomWords } from "../gen";
import TimedTypingTest from "../TimedTypingTest";
import { Language } from "../gen";

const RandomTypingTest = ({
  language,
  duration,
}: {
  language: Language;
  duration: number;
}) => {
  const [words, setWords] = useState<string[] | undefined>(undefined);
  const [seed, setSeed] = useState(generateSeed());
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    const newSeed = generateSeed();
    setWords(undefined);
    setSeed(newSeed);
    setKey(Date.now());
    importLanguage(language).then(setWords);
  }, [language]);

  useEffect(() => {
    const newSeed = generateSeed();
    setSeed(newSeed);
    setKey(Date.now());
  }, [duration]);

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
    return <div className="Loading"></div>;
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
