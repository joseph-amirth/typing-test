import { useState } from "react";
import Buttons from "../Buttons";
import "./RandomTypingTest.css";
import VerticalSpacer from "../../component/spacing/VerticalSpacer";
import { generateSeed, seedToBase64url } from "../../util/prng";
import { randomWords } from "../gen";
import BoundedTypingTest from "../BoundedTypingTest";
import { Language } from "../../service/staticcontent";
import { copyTextToClipboard } from "../../util/misc";
import { TestFinishEvent } from "../props";
import { useService } from "../../service";
import { ResultsService } from "../../service/results";
import { useLanguage } from "../../service/staticcontent/hooks";
import { NotificationsService } from "../../service/notifications";
import { REPEATED_TEST_NOTIFICATION } from "../../service/notifications/constants";

const RandomTypingTest = ({
  language,
  length,
}: {
  language: Language;
  length: number;
}) => {
  const resultsService = useService(ResultsService);
  const notificationsService = useService(NotificationsService);

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
      `${window.location.origin}/words/${language}/${length}/${seedToBase64url(
        seed,
      )}`,
    );
  };

  if (words === undefined) {
    return;
  }

  const test = randomWords(seed, words, length);

  const handleTestFinish = (event: TestFinishEvent) => {
    if (restarted) {
      notificationsService.addNotification(REPEATED_TEST_NOTIFICATION);
      return;
    }
    const { wpm, rawWpm, accuracy } = event;
    resultsService.reportResult({
      testParams: {
        mode: "words",
        params: {
          language,
          length,
        },
      },
      testCompletedTimestamp: Date.now(),
      wpm,
      rawWpm,
      accuracy,
    });
  };

  return (
    <div className="RandomTypingTest">
      <BoundedTypingTest
        key={key}
        test={test}
        onTestFinish={handleTestFinish}
      />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default RandomTypingTest;
