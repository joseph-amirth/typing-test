export const isTestDone = (test, attempt) => {
  return (
    (test.length === attempt.length && test.at(-1) === attempt.at(-1)) ||
    test.length < attempt.length
  );
};

export const getAccuracy = ({ correctChars, incorrectChars }) => {
  return correctChars / (correctChars + incorrectChars);
};
