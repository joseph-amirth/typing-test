import { useState } from "react";
import Buttons from "../Buttons";
import "./RandomTypingTest.css";
import VerticalSpacer from "../../common/VerticalSpacer";
import { generateSeed } from "../../util/prng";
import { randomWords } from "../gen";
import BoundedTypingTest from "../BoundedTypingTest";

const RandomTypingTest = ({
  words,
  length,
}: {
  words: string[];
  length: number;
}) => {
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
    // TODO: Make link sharing work again.
    // copyTextToClipboard(
    //   `${window.location.origin}/words/${language}/${length}/${seedToBase64url(
    //     seed,
    //   )}`,
    // );
  };

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
