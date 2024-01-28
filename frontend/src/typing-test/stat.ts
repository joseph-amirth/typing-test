import { roundToTwoDecimalPlaces } from "../util/math";

export interface Stats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
}

export interface CharCounts {
  correctChars: number;
  incorrectChars: number;
}

export function calculateStats({
  test,
  attempt,
  duration,
  charCounts,
}: {
  test: string[];
  attempt: string[];
  duration: number;
  charCounts: CharCounts;
}): Stats {
  const wpm = computeWpm(test, attempt, duration);
  const rawWpm = computeRawWpm(attempt, duration);
  const accuracy = computeAccuracy(charCounts);
  return { wpm, rawWpm, accuracy };
}

export function calculateCharCounts({
  test,
  newAttempt,
  attempt,
  charCounts,
}: {
  test: string[];
  newAttempt: string[];
  attempt: string[];
  charCounts: CharCounts;
}): CharCounts {
  const lastIndex = newAttempt.length - 1;
  let { correctChars, incorrectChars } = charCounts;
  if (
    newAttempt.length === attempt.length &&
    newAttempt[lastIndex].length > attempt[lastIndex].length
  ) {
    if (
      newAttempt[lastIndex].at(-1) ===
      test[newAttempt.length - 1][newAttempt[lastIndex].length - 1]
    ) {
      correctChars += 1;
    } else {
      incorrectChars += 1;
    }
  } else if (newAttempt.length > attempt.length) {
    if (newAttempt.at(-2) === test[newAttempt.length - 2]) {
      correctChars += 1;
    } else {
      incorrectChars += 1;
    }
  }
  return {
    correctChars,
    incorrectChars,
  };
}

// Helper method that cuts out the extra words at the end of the generated test.
// It also cuts out extra letters at the end of the last word typed.
export function getActualTest(test: string[], attempt: string[]): string[] {
  if (attempt.length > test.length) {
    return test;
  }
  const actualTest = test.slice(0, attempt.length);
  const last = attempt.length - 1;
  actualTest[last] = actualTest[last].slice(0, attempt.at(-1)!.length);
  return actualTest;
}

// To compute the WPM, only the number of characters typed for correctly
// typed words is considered.
function computeWpm(
  test: string[],
  attempt: string[],
  duration: number,
): number {
  let charCount = 0;
  for (let i = 0; i + 1 < test.length; i++) {
    if (test[i] === attempt[i]) {
      charCount += test[i].length + 1;
    }
  }
  if (test.at(-1) === attempt.at(-1)) {
    charCount += test.at(-1)!.length;
  }
  return computeWpmHelper(charCount, duration);
}

// To compute raw WPM, only the number of characters typed is considered.
// There is no check for correctly typed characters or words.
function computeRawWpm(attempt: string[], duration: number): number {
  let charCount = 0;
  for (const word of attempt) {
    charCount += word.length;
  }
  charCount += attempt.length - 1; // Counting spaces.
  return computeWpmHelper(charCount, duration);
}

function computeAccuracy({ correctChars, incorrectChars }: CharCounts): number {
  const accuracy = correctChars / (correctChars + incorrectChars);
  return roundToTwoDecimalPlaces(100 * accuracy);
}

// Computes WPM given the number of characters typed and the
// duration in seconds.
function computeWpmHelper(charCount: number, duration: number): number {
  return roundToTwoDecimalPlaces((60 * charCount) / (5 * duration));
}
