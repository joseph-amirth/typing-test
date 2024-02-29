/* Common sets of props used in typing test components. */

import { Stats } from "./stat";

export interface TypingTestCallbacks {
  onTestStart?: () => void;
  onTestUpdate?: (attempt: string[], newAttempt: string[]) => void;
  onTestFinish?: (event: TestFinishEvent) => void;
}

export interface TestFinishEvent extends Stats {
  attempt: string[];
  duration: number;
}
