import { Language } from "../service/static-content";
import { Seed } from "../util/prng";
import { QuoteModeLength } from "../context/preference";
import { useLoaderData } from "react-router-dom";
import WordsTypingTest from "../typing-test/words/SeededTypingTest";
import TimeTypingTest from "../typing-test/time/SeededTypingTest";
import QuoteTypingTest from "../typing-test/quote/SpecificTypingTest";

function SeededTypingTestView() {
  const loaderData = useLoaderData() as SeededTypingTestParams;

  return (
    <div className="SeededTypingTestView">{getTypingTestView(loaderData)}</div>
  );
}

function getTypingTestView({ mode, params }: SeededTypingTestParams) {
  switch (mode) {
    case "words":
      return <WordsTypingTest {...params} />;
    case "time":
      return <TimeTypingTest {...params} />;
    case "quote":
      return <QuoteTypingTest {...params} />;
  }
}

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
    seed: Seed;
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
