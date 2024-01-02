import { useRef, useState } from "react";
import { isTestDone } from "../util/test";
import Diff from "./Diff";
import Result from "./Result";
import { useCharCounts } from "./useCharCounts";

import "./BoundedTypingTest.css";
import VerticalSpacer from "../common/VerticalSpacer";
import { disableCutCopyPasteProps } from "../util/component";

/**
 * @component
 * Shows a typing test that has a bounded number of words.
 * @param {string[]} test
 */
const BoundedTypingTest = ({ test }) => {
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
      <Diff test={test} attempt={attempt} isTestBounded={true} />
      <input
        type="text"
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
