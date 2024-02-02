import { useState } from "react";
import { generateSeed } from "../../util/prng";
import Buttons from "../Buttons";
import "./RandomTypingTest.css";
import VerticalSpacer from "../../common/VerticalSpacer";
import { randomWords } from "../gen";
import TimedTypingTest from "../TimedTypingTest";

const RandomTypingTest = ({
  words,
  duration,
}: {
  words: string[];
  duration: number;
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
    //   `${window.location.origin}/time/${language}/${duration}/${seedToBase64url(
    //     seed,
    //   )}`,
    // );
  };

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
