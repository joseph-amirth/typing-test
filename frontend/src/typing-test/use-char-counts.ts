import { useState } from "react";

export function useCharCounts(): [
  CharCounts,
  (test: string[], previousAttempt: string[], currentAttempt: string[]) => void,
] {
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);

  return [
    { correctChars, incorrectChars },
    (test: string[], previousAttempt: string[], currentAttempt: string[]) => {
      const lastIndex = currentAttempt.length - 1;
      if (
        currentAttempt.length === previousAttempt.length &&
        currentAttempt[lastIndex].length > previousAttempt[lastIndex].length
      ) {
        if (
          currentAttempt[lastIndex].at(-1) ===
          test[currentAttempt.length - 1][currentAttempt[lastIndex].length - 1]
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
}

export interface CharCounts {
  correctChars: number;
  incorrectChars: number;
}
