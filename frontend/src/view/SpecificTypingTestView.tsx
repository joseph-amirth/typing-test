import { Language, useLanguage } from "../context/languages";
import { Seed } from "../util/prng";
import { QuoteModeLength } from "../context/preference";
import { useLoaderData } from "react-router-dom";
import WordsTypingTest from "../typing-test/words/SeededTypingTest";
import TimeTypingTest from "../typing-test/time/SeededTypingTest";
import QuoteTypingTest from "../typing-test/quote/SpecificTypingTest";

// TODO: Implement this.
function SeededTypingTestView() {
  const loaderData = useLoaderData() as SeededTypingTestParams;

  return (
    <div className="SeededTypingTestView">{getTypingTestView(loaderData)}</div>
  );
}

function getTypingTestView({ mode, params }: SeededTypingTestParams) {
  switch (mode) {
    case "words":
      return <WordsTypingTestView {...params} />;
    case "time":
      return <TimeTypingTestView {...params} />;
    case "quote":
      return <QuoteTypingTestView {...params} />;
  }
}

function WordsTypingTestView({
  language,
  length,
  seed,
}: WordsSeededTypingTestParams["params"]) {
  const words = useLanguage(language);
  if (words === undefined) {
    return;
  }
  return <WordsTypingTest words={words} length={length} seed={seed} />;
}

function TimeTypingTestView({
  language,
  duration,
  seed,
}: TimeSeededTypingTestParams["params"]) {
  const words = useLanguage(language);
  if (words === undefined) {
    return;
  }
  return <TimeTypingTest words={words} duration={duration} seed={seed} />;
}

function QuoteTypingTestView({
  length,
  id,
}: QuoteSeededTypingTestParams["params"]) {
  return <QuoteTypingTest length={length} id={id} />;
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
