import { useState } from "react";
import { generateSeed, seedToBase64url } from "../../util/prng";
import Buttons from "../Buttons";
import "./RandomTypingTest.css";
import VerticalSpacer from "../../component/spacing/VerticalSpacer";
import { randomWords } from "../gen";
import TimedTypingTest from "../TimedTypingTest";
import { Language } from "../../service/staticcontent";
import { useLanguage } from "../../service/staticcontent/hooks";
import { copyTextToClipboard } from "../../util/misc";
import { TestFinishEvent } from "../props";
import { useService } from "../../service";
import { ResultsService } from "../../service/results";

const RandomTypingTest = ({
  language,
  duration,
}: {
  language: Language;
  duration: number;
}) => {
  const resultsService = useService(ResultsService);

  const words = useLanguage(language);
  const [seed, setSeed] = useState(generateSeed());
  const [key, setKey] = useState(Date.now());
  const [restarted, setRestarted] = useState(false);

  const nextTest = () => {
    let newSeed = generateSeed();
    while (newSeed === seed) {
      newSeed = generateSeed();
    }
    setSeed(newSeed);
    setKey(Date.now());
    setRestarted(false);
  };

  const restartTest = () => {
    setKey(Date.now());
    setRestarted(true);
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

  const handleTestFinish = (event: TestFinishEvent) => {
    if (restarted) {
      return;
    }
    const { wpm, rawWpm, accuracy } = event;
    resultsService.reportResult({
      testParams: {
        mode: "time",
        params: {
          language,
          duration,
        },
      },
      testCompletedTimestamp: Date.now(),
      wpm,
      rawWpm,
      accuracy,
    });
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
        onTestFinish={handleTestFinish}
      />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default RandomTypingTest;
