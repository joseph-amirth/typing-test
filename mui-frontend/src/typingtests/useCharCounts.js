import { useState } from "react";

export const useCharCounts = () => {
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);

  return [
    { correctChars, incorrectChars },
    (test, previousAttempt, currentAttempt) => {
      if (
        currentAttempt.length === previousAttempt.length &&
        currentAttempt.at(-1).length > previousAttempt.at(-1).length
      ) {
        if (
          currentAttempt.at(-1).at(-1) ===
          test[currentAttempt.length - 1][currentAttempt.at(-1).length - 1]
        ) {
          setCorrectChars(correctChars + 1);
        } else {
          setIncorrectChars(incorrectChars + 1);
        }
      } else if (currentAttempt.length > previousAttempt.length) {
        if (currentAttempt.at(-2) === test[currentAttempt.length - 2]) {
          setCorrectChars(correctChars + 1);
        } else {
          setIncorrectChars(incorrectChars + 1);
        }
      }
    },
  ];
};
