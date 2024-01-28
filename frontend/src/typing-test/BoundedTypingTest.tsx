import { useRef, useState } from "react";
import Diff from "./Diff";
import Result from "./Result";
import "./BoundedTypingTest.css";
import VerticalSpacer from "../common/VerticalSpacer";
import { ANTI_CHEAT_PROPS } from "../util/component";
import { usePreference } from "../context/preference";
import {
  CharCounts,
  calculateCharCounts,
  calculateStats,
  getActualTest,
} from "./stat";

export interface BoundedTypingTestProps {
  test: string[];
  enabled?: boolean;
  onStart?: () => void;
  onUpdate?: (attempt: string[], newAttempt: string[]) => void;
  onFinish?: (attempt: string[], duration: number) => void;
  options?: {
    allowSkipping?: boolean;
    allowBackpedal?: boolean;
  };
}

const BoundedTypingTest = ({
  test,
  enabled,
  onStart,
  onUpdate,
  onFinish,
  options,
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

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (enabled !== undefined && !enabled) {
      return;
    }
    if (!start) {
      setStart(performance.now());
      if (onStart) onStart();
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
      if (
        options?.allowSkipping !== undefined &&
        !options?.allowSkipping &&
        newAttempt.length > attempt.length &&
        newAttempt[attempt.length - 1] !== test[attempt.length - 1]
      ) {
        return;
      }
      setAttempt(newAttempt);

      setCharCounts(
        calculateCharCounts({ test, attempt, newAttempt, charCounts }),
      );

      if (onUpdate) onUpdate(attempt, newAttempt);

      if (isTestDone(test, newAttempt)) {
        const end = performance.now();
        setEnd(end);
        if (onFinish) onFinish(newAttempt, end - start!);
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
      <input
        type="text"
        value={attempt.join(" ")}
        ref={inputRef}
        className="Hide"
        onInput={handleInput}
        autoFocus
        {...ANTI_CHEAT_PROPS}
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
