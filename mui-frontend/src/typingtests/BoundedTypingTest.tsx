import { useRef, useState } from "react";
import { isTestDone } from "../util/test";
import Diff from "./Diff";
import Result from "./Result";
import { useCharCounts } from "./useCharCounts";
import "./BoundedTypingTest.css";
import VerticalSpacer from "../common/VerticalSpacer";
import { disableCutCopyPasteProps } from "../util/component";
import { usePreference } from "../context/preferences";

const BoundedTypingTest = ({ test }: { test: string[] }) => {
  const [maxCharsInLine] = usePreference("maxCharsInLine");
  const [showAllLines] = usePreference("showAllLines");

  const [attempt, setAttempt] = useState("".split(" "));

  const [start, setStart] = useState<number | undefined>(undefined);
  const [end, setEnd] = useState<number | undefined>(undefined);

  const [charCounts, updateCharCounts] = useCharCounts();

  const [progress, setProgress] = useState(0);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!start) {
      setStart(performance.now());
    }
    if (!end) {
      const previousAttempt = attempt;

      const currentAttempt = event.target.value.split(" ");
      if (
        currentAttempt.length <= test.length &&
        currentAttempt[currentAttempt.length - 1].length >
          test[currentAttempt.length - 1].length + 20
      ) {
        return;
      }
      setAttempt(currentAttempt);
      setProgress(currentAttempt.length - 1);

      updateCharCounts(test, previousAttempt, currentAttempt);

      if (isTestDone(test, currentAttempt)) {
        setEnd(performance.now());
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
      <Diff
        test={test}
        attempt={attempt}
        maxCharsInLine={maxCharsInLine}
        showAllLines={showAllLines}
      />
      <input
        type="text"
        value={attempt.join(" ")}
        ref={inputRef}
        className="Hide"
        onInput={handleInput}
        autoFocus
        {...disableCutCopyPasteProps()}
      />
      {start && end && (
        <>
          <VerticalSpacer />
          <Result
            test={test}
            attempt={attempt}
            duration={(end - start) / 1000}
            charCounts={charCounts}
          />
        </>
      )}
    </div>
  );
};

export default BoundedTypingTest;
