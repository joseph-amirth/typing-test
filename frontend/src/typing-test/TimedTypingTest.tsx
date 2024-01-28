import { useRef, useState } from "react";
import Diff from "./Diff";
import Result from "./Result";
import "./TimedTypingTest.css";
import { usePreference } from "../context/preference";
import VerticalSpacer from "../common/VerticalSpacer";
import { ANTI_CHEAT_PROPS } from "../util/component";
import {
  CharCounts,
  calculateCharCounts,
  calculateStats,
  getActualTest,
} from "./stat";

const TimedTypingTest = ({
  generateTest,
  duration,
}: {
  generateTest: (length: number) => string[];
  duration: number;
}) => {
  const [maxCharsInLine] = usePreference("maxCharsInLine");
  const padding = maxCharsInLine; // test is always "padded" with this many more words compared to attempt.

  const [test, setTest] = useState(generateTest(padding));
  const [attempt, setAttempt] = useState("".split(" "));

  const [start, setStart] = useState<number | undefined>(undefined);
  const [end, setEnd] = useState(false);

  const [charCounts, setCharCounts] = useState<CharCounts>({
    correctChars: 0,
    incorrectChars: 0,
  });

  const [progress, setProgress] = useState(duration);

  const stats = calculateStats({
    test: getActualTest(test, attempt),
    attempt,
    duration: (performance.now() - start!) / 1000,
    charCounts,
  });

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!start) {
      setStart(performance.now());
      const intervalId = setInterval(() => {
        setProgress((progress) => {
          if (progress === 1) {
            clearInterval(intervalId);
            setEnd(true);
          }
          return progress - 1;
        });
      }, 1000);
    }
    if (!end) {
      const newAttempt = event.target.value.split(" ");
      if (
        newAttempt.length <= test.length &&
        newAttempt[newAttempt.length - 1].length >
          test[newAttempt.length - 1].length + 20
      ) {
        return;
      }
      setAttempt(newAttempt);
      if (newAttempt.length + padding > test.length) {
        setTest(generateTest(newAttempt.length + padding));
      }

      setCharCounts(
        calculateCharCounts({ test, attempt, newAttempt, charCounts }),
      );
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    inputRef.current!.focus();
  };

  return (
    <div className="TimedTypingTest" onClick={handleClick}>
      <Progress progress={progress} hide={!start || end} />
      <Diff test={test} attempt={attempt} showAllLines={false} />
      <input
        type="text"
        value={attempt.join(" ")}
        ref={inputRef}
        className="Hide"
        onInput={handleInput}
        autoFocus
        {...ANTI_CHEAT_PROPS}
      />
      {end && (
        <>
          <VerticalSpacer />
          <Result {...stats} />
        </>
      )}
    </div>
  );
};

const Progress = ({ progress, hide }: { progress: number; hide: boolean }) => {
  const minutes = Math.floor(progress / 60);
  const seconds = progress % 60;

  return (
    <div
      className="Progress"
      style={{ visibility: hide ? "hidden" : "inherit" }}
    >
      {minutes === 0
        ? seconds
        : `${minutes}:${seconds.toString().padStart(2, "0")}`}
    </div>
  );
};

export default TimedTypingTest;
