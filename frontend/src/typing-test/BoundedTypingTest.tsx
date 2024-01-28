import { useRef, useState } from "react";
import { isTestDone } from "../util/test";
import Diff from "./Diff";
import Result from "./Result";
import { useCharCounts } from "./use-char-counts";
import "./BoundedTypingTest.css";
import VerticalSpacer from "../common/VerticalSpacer";
import { ANTI_CHEAT_PROPS } from "../util/component";
import { usePreference } from "../context/preference";
import { Stats, calculateStats } from "./stat";

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

  const [, updateCharCounts] = useCharCounts();

  const [progress, setProgress] = useState(0);

  const [stats, setStats] = useState<Stats>({
    wpm: 0,
    rawWpm: 0,
    accuracy: 0,
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
      setProgress(newAttempt.length - 1);

      const newCharCounts = updateCharCounts(test, attempt, newAttempt);

      if (onUpdate) onUpdate(attempt, newAttempt);
      setStats(
        calculateStats({
          test,
          attempt: newAttempt,
          duration: (performance.now() - start!) / 1000,
          charCounts: newCharCounts,
        }),
      );

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

export default BoundedTypingTest;
