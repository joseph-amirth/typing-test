import { useState } from "react";
import Buttons from "../Buttons";
import "./RandomTypingTest.css";
import VerticalSpacer from "../../common/VerticalSpacer";
import { generateSeed, seedToBase64url } from "../../util/prng";
import { randomWords } from "../gen";
import BoundedTypingTest from "../BoundedTypingTest";
import { Language, useLanguage } from "../../context/languages";
import { copyTextToClipboard } from "../../util/misc";

const RandomTypingTest = ({
  language,
  length,
}: {
  language: Language;
  length: number;
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
      `${window.location.origin}/words/${language}/${length}/${seedToBase64url(
        seed,
      )}`,
    );
  };

  if (words === undefined) {
    return;
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
