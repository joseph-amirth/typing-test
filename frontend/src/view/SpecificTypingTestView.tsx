import { Language } from "../context/languages";
import { Seed } from "../util/prng";
import { QuoteModeLength } from "../context/preference";

// TODO: Implement this.
function SeededTypingTestView() {
  return <div className="SeededTypingTestView"></div>;
}

// @ts-ignore unused type.
type SeededTypingTestParams =
  | WordsSeededTypingTestParams
  | TimeSeededTypingTestParams
  | QuoteSeededTypingTestParams;

interface WordsSeededTypingTestParams {
  mode: "words";
  params: {
    language: Language;
    length: number;
    seed: Seed;
  };
}

export interface TimeSeededTypingTestParams {
  mode: "time";
  params: {
    language: Language;
    duration: number;
    id: number;
  };
}

export interface QuoteSeededTypingTestParams {
  mode: "quote";
  params: {
    length: QuoteModeLength;
    id: number;
  };
}

export default SeededTypingTestView;
