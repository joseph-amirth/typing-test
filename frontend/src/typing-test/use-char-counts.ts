import { useState } from "react";

export function useCharCounts(): [
  CharCounts,
  (
    test: string[],
    previousAttempt: string[],
    currentAttempt: string[],
  ) => CharCounts,
] {
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);

  return [
    { correctChars, incorrectChars },
    (test: string[], previousAttempt: string[], currentAttempt: string[]) => {
      const lastIndex = currentAttempt.length - 1;
      let newCorrectChars = correctChars;
      let newIncorrectChars = incorrectChars;
      if (
        currentAttempt.length === previousAttempt.length &&
        currentAttempt[lastIndex].length > previousAttempt[lastIndex].length
      ) {
        if (
          currentAttempt[lastIndex].at(-1) ===
          test[currentAttempt.length - 1][currentAttempt[lastIndex].length - 1]
        ) {
          newCorrectChars += 1;
        } else {
          newIncorrectChars += 1;
        }
      } else if (currentAttempt.length > previousAttempt.length) {
        if (currentAttempt.at(-2) === test[currentAttempt.length - 2]) {
          newCorrectChars += 1;
        } else {
          newIncorrectChars += 1;
        }
      }
      setCorrectChars(newCorrectChars);
      setIncorrectChars(newIncorrectChars);
      return {
        correctChars: newCorrectChars,
        incorrectChars: newIncorrectChars,
      };
    },
  ];
}

export interface CharCounts {
  correctChars: number;
  incorrectChars: number;
}
