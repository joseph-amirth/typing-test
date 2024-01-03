import { useState } from "react";

/**
 * @component
 * Shows a typing test whose word count is not bounded and whose completion is
 * controlled by the parent.
 *
 * @param {string[] -> string[]} generateTest - Function that generates a test
 * given the user's attempt.
 * @param {number} duration - Duration of the test in seconds.
 */
const UnboundedTypingTest = ({ generateTest, end }) => {
  const [attempt, setAttempt] = useState("".split(" "));
  const [test, setTest] = useState(generateTest(attempt));

  const [start, setStart] = useState(false);
  const [end, setEnd] = useState(false);

  const [charCounts, updateCharCounts] = useCharCounts();

  const [progress, setProgress] = useState(duration);

  const handleInput = (event) => {
    if (!start) {
      setStart(true);
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
      const previousAttempt = attempt;

      const currentAttempt = event.target.value.split(" ");
      setAttempt(currentAttempt);
      if (currentAttempt.length + padding > test.length) {
        setTest(generateTest(currentAttempt.length + padding));
      }

      updateCharCounts(test, previousAttempt, currentAttempt);
    }
  };

  const inputRef = useRef(null);
  const handleClick = () => {
    inputRef.current.focus();
  };

  return (
    <div className="UnboundedTypingTest" onClick={handleClick}>
      {start && !end && <Progress progress={progress} />}
      <Diff test={test} attempt={attempt} isTestBounded={false} />
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
            test={getActualTest(test, attempt)}
            attempt={attempt}
            duration={duration}
            charCounts={charCounts}
          />
        </>
      )}
    </div>
  );
};

const Progress = ({ progress }) => {
  const minutes = Math.floor(progress / 60);
  const seconds = progress % 60;

  return (
    <div className="Progress">
      {minutes === 0
        ? seconds
        : `${minutes}:${seconds.toString().padStart(2, "0")}`}
    </div>
  );
};

// Helper method that cuts out the extra words at the end of the generated test.
// It also cuts out extra letters at the end of the last word typed.
const getActualTest = (test, attempt) => {
  const actualTest = test.slice(0, attempt.length);
  const last = attempt.length - 1;
  actualTest[last] = actualTest[last].slice(0, attempt.at(-1).length);
  return actualTest;
};

export default UnboundedTypingTest;