import { postResult } from "../util/backend";
import { useIsSignedIn } from "../context/user";
import { useTypingTestParams } from "../context/preferences";
import { getAccuracy } from "../util/test";
import { roundToTwoDecimalPlaces, timestampInSecs } from "../util/math";

import "./Result.css";
import { CharCounts } from "./useCharCounts";

const Result = ({
  test,
  attempt,
  duration,
  charCounts,
}: {
  test: string[];
  attempt: string[];
  duration: number;
  charCounts: CharCounts;
}) => {
  const wpm = computeWpm(test, attempt, duration);
  const rawWpm = computeRawWpm(attempt, duration);
  const accuracy = computeAccuracy(charCounts);

  const isSignedIn = useIsSignedIn();
  const typingTestParams = useTypingTestParams();

  if (isSignedIn) {
    postResult(typingTestParams, timestampInSecs(), wpm, rawWpm, accuracy);
  }

  return (
    <div className="Result">
      <Stat name="WPM" value={wpm} />
      <Stat name="Accuracy" value={accuracy} />
      <Stat name="Raw WPM" value={rawWpm} />
    </div>
  );
};

const Stat = ({ name, value }: { name: string; value: number }) => {
  return (
    <div className="Stat">
      <div className="Name">{name}</div>
      <div className="Value">{value}</div>
    </div>
  );
};

// To compute the WPM, only the number of characters typed for correctly
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
  for (let word of attempt) {
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

export default Result;
