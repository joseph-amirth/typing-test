import { useEffect, useState } from "react";
import { postTest } from "../../util/backend";
import { copyTextToClipboard } from "../../util/misc";
import { generate32bitSeed } from "../../util/prng";
import Buttons from "../Buttons";
import SeededTypingTest from "./SeededTypingTest";

import "./RandomTypingTest.css";
import VerticalSpacer from "../../common/VerticalSpacer";

const RandomTypingTest = ({ language = "english", length = 100 }) => {
  const [id, setId] = useState("");
  const [seed, setSeed] = useState(-1);
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    const newSeed = generate32bitSeed();
    setSeed(newSeed);
    setKey(Date.now());
    postTest("words", { language, length, seed: newSeed }).then(setId);
  }, [language, length]);

  const nextTest = () => {
    let newSeed = generate32bitSeed();
    while (newSeed === seed) {
      newSeed = generate32bitSeed();
    }
    setSeed(newSeed);
    setKey(Date.now());
    postTest("words", { language, length, seed: newSeed }).then(setId);
  };

  const restartTest = () => {
    setKey(Date.now());
  };

  const shareLinkToTest = () => {
    copyTextToClipboard(`${window.location.origin}/${id}`);
  };

  return (
    <div className="RandomTypingTest">
      <SeededTypingTest
        key={key}
        language={language}
        length={length}
        seed={seed}
      />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default RandomTypingTest;
