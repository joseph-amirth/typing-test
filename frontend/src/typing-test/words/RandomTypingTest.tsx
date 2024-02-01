import { useEffect, useState } from "react";
import { copyTextToClipboard } from "../../util/misc";
import Buttons from "../Buttons";
import "./RandomTypingTest.css";
import VerticalSpacer from "../../common/VerticalSpacer";
import { generateSeed, seedToBase64url } from "../../util/prng";
import { randomWords } from "../gen";
import BoundedTypingTest from "../BoundedTypingTest";
import { Language } from "../gen";

const RandomTypingTest = ({
  language = "english",
  length = 100,
}: {
  language: Language;
  length: number;
}) => {
  const [seed, setSeed] = useState(generateSeed());
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    const newSeed = generateSeed();
    setSeed(newSeed);
    setKey(Date.now());
  }, [language, length]);

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

  const test = randomWords(seed, language, length);

  return (
    <div className="RandomTypingTest">
      <BoundedTypingTest key={key} test={test} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default RandomTypingTest;
