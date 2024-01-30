import { useRef, useState } from "react";
import Diff from "./Diff";
import Result from "./Result";
import "./BoundedTypingTest.css";
import VerticalSpacer from "../common/VerticalSpacer";
import { usePreference } from "../context/preference";
import {
  CharCounts,
  calculateCharCounts,
  calculateStats,
  getActualTest,
} from "./stat";
import Input, { InputOptions } from "./Input";
import { TypingTestEventListeners } from "./props";

export interface BoundedTypingTestProps
  extends InputOptions,
    TypingTestEventListeners {
  test: string[];
}

const BoundedTypingTest = ({
  test,
  onTestStart,
  onTestUpdate,
  onTestFinish,
  ...inputOptions
}: BoundedTypingTestProps) => {
  const [showAllLines] = usePreference("showAllLines");

  const [attempt, setAttempt] = useState("".split(" "));

  const [start, setStart] = useState<number | undefined>(undefined);
  const [end, setEnd] = useState<number | undefined>(undefined);

  const [charCounts, setCharCounts] = useState<CharCounts>({
    correctChars: 0,
    incorrectChars: 0,
  });

  const progress = attempt.length - 1;

  const stats = calculateStats({
    test: getActualTest(test, attempt),
    attempt,
    duration: (performance.now() - start!) / 1000,
    charCounts,
  });

  const handleAttemptUpdate = (newAttempt: string[]) => {
    if (!start) {
      setStart(performance.now());
      if (onTestStart) onTestStart();
    }
    if (!end) {
      setAttempt(newAttempt);

      setCharCounts(
        calculateCharCounts({ test, attempt, newAttempt, charCounts }),
      );

      if (onTestUpdate) onTestUpdate(attempt, newAttempt);

      if (isTestDone(test, newAttempt)) {
        const end = performance.now();
        setEnd(end);
        if (onTestFinish) onTestFinish(newAttempt, end - start!);
      }
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="BoundedTypingTest" onClick={handleClick}>
      <div
        className="Progress"
        style={{ visibility: !start || end ? "hidden" : "inherit" }}
      >
        {progress} / {test.length}
      </div>
      <Diff test={test} attempt={attempt} showAllLines={showAllLines} />
      <Input
        ref={inputRef}
        enabled={true}
        test={test}
        attempt={attempt}
        onAttemptUpdate={handleAttemptUpdate}
        {...inputOptions}
      />
      {start && end && (
        <>
          <VerticalSpacer />
          <Result {...stats} />
        </>
      )}
    </div>
  );
};

function isTestDone(test: string[], attempt: string[]): boolean {
  return (
    (test.length === attempt.length && test.at(-1) === attempt.at(-1)) ||
    test.length < attempt.length
  );
}

export default BoundedTypingTest;
