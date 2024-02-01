import { useEffect, useState } from "react";
import { copyTextToClipboard } from "../../util/misc";
import Buttons from "../Buttons";
import "./RandomTypingTest.css";
import VerticalSpacer from "../../common/VerticalSpacer";
import { generateSeed, seedToBase64url } from "../../util/prng";
import { importLanguage, randomWords } from "../gen";
import BoundedTypingTest from "../BoundedTypingTest";
import { Language } from "../gen";

const RandomTypingTest = ({
  language = "english",
  length = 100,
}: {
  language: Language;
  length: number;
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
  }, [length]);

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
      `${window.location.origin}/words/${language}/${length}/${seedToBase64url(
        seed,
      )}`,
    );
  };

  if (words === undefined) {
    return <div className="Loading"> </div>;
  }

  const test = randomWords(seed, words, length);

  return (
    <div className="RandomTypingTest">
      <BoundedTypingTest key={key} test={test} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default RandomTypingTest;
