import { useRef, useState } from "react";
import { isTestDone } from "../util/test";
import Diff from "./Diff";
import Result from "./Result";
import { useCharCounts } from "./useCharCounts";
import "./BoundedTypingTest.css";
import VerticalSpacer from "../common/VerticalSpacer";
import { disableCutCopyPasteProps } from "../util/component";
import { usePreference } from "../context/preferences";

/**
 * @component
 * Shows a typing test that has a bounded number of words.
 * @param {string[]} test
 */
const BoundedTypingTest = ({ test }) => {
  const [maxCharsInLine] = usePreference("maxCharsInLine");
  const [showAllLines] = usePreference("showAllLines");

  const [attempt, setAttempt] = useState("".split(" "));

  const [start, setStart] = useState();
  const [end, setEnd] = useState();

  const [charCounts, updateCharCounts] = useCharCounts();

  const [progress, setProgress] = useState(0);

  const handleInput = (event) => {
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

  const inputRef = useRef(null);
  const handleClick = () => {
    inputRef.current.focus();
  };

  return (
    <div className="BoundedTypingTest" onClick={handleClick}>
      {start && !end && (
        <div className="Progress">
          {progress} / {test.length}
        </div>
      )}
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
      {end && (
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
