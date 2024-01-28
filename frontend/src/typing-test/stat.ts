// To compute the WPM, only the number of characters typed for correctly

import { roundToTwoDecimalPlaces } from "../util/math";
import { getAccuracy } from "../util/test";
import { CharCounts } from "./use-char-counts";

export interface Stats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
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

// typed words is considered.
const computeWpm = (test: string[], attempt: string[], duration: number) => {
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
};

// To compute raw WPM, only the number of characters typed is considered.
// There is no check for correctly typed characters or words.
const computeRawWpm = (attempt: string[], duration: number) => {
  let charCount = 0;
  for (const word of attempt) {
    charCount += word.length;
  }
  charCount += attempt.length - 1; // Counting spaces.
  return computeWpmHelper(charCount, duration);
};

const computeAccuracy = (charCounts: CharCounts) => {
  const accuracy = getAccuracy(charCounts);
  return roundToTwoDecimalPlaces(100 * accuracy);
};

// Computes WPM given the number of characters typed and the
// duration in seconds.
const computeWpmHelper = (charCount: number, duration: number) => {
  return roundToTwoDecimalPlaces((60 * charCount) / (5 * duration));
};
