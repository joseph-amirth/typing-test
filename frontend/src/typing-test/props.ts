/* Common sets of props used in typing test components. */

export interface TypingTestEventListeners {
  onTestStart?: () => void;
  onTestUpdate?: (attempt: string[], newAttempt: string[]) => void;
  onTestFinish?: (attempt: string[], duration: number) => void;
}
