export function isTestDone(test: string[], attempt: string[]): boolean {
  return (
    (test.length === attempt.length && test.at(-1) === attempt.at(-1)) ||
    test.length < attempt.length
  );
}

export function getAccuracy({
  correctChars,
  incorrectChars,
}: {
  correctChars: number;
  incorrectChars: number;
}): number {
  return correctChars / (correctChars + incorrectChars);
}
