import { useEffect, useRef, useState } from "react";
import Diff from "./Diff";
import Result from "./Result";
import "./TimedTypingTest.css";
import VerticalSpacer from "../component/spacing/VerticalSpacer";
import {
  CharCounts,
  calculateCharCounts,
  calculateStats,
  getActualTest,
} from "./stat";
import Input, { InputOptions } from "./Input";
import { TypingTestCallbacks } from "./props";

interface TimedTypingTestProps extends InputOptions, TypingTestCallbacks {
  generateTest: (length: number) => string[];
  duration: number;
}

const PADDING = 60;

const TimedTypingTest = ({
  generateTest,
  duration,
  onTestStart,
  onTestUpdate,
  onTestFinish,
  ...inputOptions
}: TimedTypingTestProps) => {
  const [test, setTest] = useState(generateTest(PADDING));
  const [attempt, setAttempt] = useState("".split(" "));

  const [start, setStart] = useState<number | undefined>(undefined);
  const [end, setEnd] = useState<number | undefined>(undefined);

  const [charCounts, setCharCounts] = useState<CharCounts>({
    correctChars: 0,
    incorrectChars: 0,
  });

  const [progress, setProgress] = useState(duration);

  const stats = calculateStats({
    test: getActualTest(test, attempt),
    attempt,
    duration: ((end ?? performance.now()) - start!) / 1000,
    charCounts,
  });

  useEffect(() => {
    if (start !== undefined && onTestStart) {
      onTestStart();
    }
  }, [start]);

  useEffect(() => {
    if (end !== undefined && onTestFinish) {
      const duration = (end! - start!) / 1000;
      onTestFinish({ attempt, duration, ...stats });
    }
  }, [end]);

  const handleAttemptUpdate = (newAttempt: string[]) => {
    if (!start) {
      setStart(performance.now());
      const intervalId = setInterval(() => {
        setProgress((progress) => {
          if (progress === 1) {
            clearInterval(intervalId);
            setEnd(performance.now());
          }
          return progress - 1;
        });
      }, 1000);
    }
    if (!end) {
      setAttempt(newAttempt);
      if (onTestUpdate) onTestUpdate(attempt, newAttempt);
      if (newAttempt.length + PADDING > test.length) {
        setTest(generateTest(newAttempt.length + PADDING));
      }

      setCharCounts(
        calculateCharCounts({
          test,
          attempt: attempt,
          newAttempt,
          charCounts,
        }),
      );
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    inputRef.current!.focus();
  };

  return (
    <div className="TimedTypingTest" onClick={handleClick}>
      <Progress
        progress={progress}
        hide={start === undefined || end !== undefined}
      />
      <Diff test={test} attempt={attempt} showAllLines={false} />
      <Input
        ref={inputRef}
        enabled={true}
        test={test}
        attempt={attempt}
        onAttemptUpdate={handleAttemptUpdate}
        {...inputOptions}
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
