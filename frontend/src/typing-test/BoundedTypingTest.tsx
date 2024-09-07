import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Diff from "./Diff";
import Result from "./Result";
import "./BoundedTypingTest.css";
import VerticalSpacer from "../component/spacing/VerticalSpacer";
import { usePreference } from "../service/preferences/hooks";
import {
  CharCounts,
  calculateCharCounts,
  calculateStats,
  getActualTest,
} from "./stat";
import Input, { InputHandle, InputOptions } from "./Input";
import { TypingTestCallbacks } from "./props";

export interface BoundedTypingTestProps
  extends InputOptions,
    TypingTestCallbacks {
  test: string[];
}

const BoundedTypingTest = (
  {
    test,
    onTestStart,
    onTestUpdate,
    onTestFinish,
    ...inputOptions
  }: BoundedTypingTestProps,
  ref: React.ForwardedRef<InputHandle>,
) => {
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
    duration: ((end ?? performance.now()) - start!) / 1000,
    charCounts,
  });

  useEffect(() => {
    if (start !== undefined && onTestStart) {
      onTestStart();
    }
  }, [start, onTestStart]);

  useEffect(() => {
    if (end !== undefined && onTestFinish) {
      const duration = (end! - start!) / 1000;
      onTestFinish({ attempt, duration, ...stats });
    }
  }, [end]);

  const handleAttemptUpdate = (newAttempt: string[]) => {
    if (!start) {
      setStart(performance.now());
    }
    if (!end) {
      setAttempt(newAttempt);

      setCharCounts(
        calculateCharCounts({ test, attempt, newAttempt, charCounts }),
      );

      if (onTestUpdate) onTestUpdate(attempt, newAttempt);

      if (isTestDone(test, newAttempt)) {
        setEnd(performance.now());
      }
    }
  };

  const inputRef = useRef<InputHandle>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);

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

const BoundedTypingTestWithForwardedRef = forwardRef(BoundedTypingTest);

export default BoundedTypingTestWithForwardedRef;
