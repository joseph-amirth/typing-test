import { useEffect, useState } from "react";
import VerticalSpacer from "../../common/VerticalSpacer";
import { copyTextToClipboard } from "../../util/misc";
import BoundedTypingTest from "../BoundedTypingTest";
import Buttons from "../Buttons";
import quotesInfo from "../../static/quotes.json";
import { randomInt } from "../../util/math";
import { QuoteModeLength } from "../../context/preference";

const getRandomQuote = (
  length: QuoteModeLength,
  oldQuoteId: number | undefined = undefined,
) => {
  const [first, last] = quotesInfo[length];
  const quotes = quotesInfo.quotes;

  let newQuoteId = randomInt(first, last);
  if (oldQuoteId !== undefined) {
    while (newQuoteId === oldQuoteId) {
      newQuoteId = randomInt(first, last);
    }
  }
  return { newQuoteId, newQuote: quotes[newQuoteId] };
};

const RandomTypingTest = ({ length }: { length: QuoteModeLength }) => {
  const [quoteId, setQuoteId] = useState(-1);
  const [quote, setQuote] = useState({ text: "" });
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    const { newQuoteId, newQuote } = getRandomQuote(length);
    setQuoteId(newQuoteId);
    setQuote(newQuote);
    setKey(Date.now());
  }, [length]);

  const restartTest = () => {
    setKey(Date.now());
  };

  const nextTest = () => {
    const { newQuoteId, newQuote } = getRandomQuote(
      length,
      /* oldQuoteId= */ quoteId,
    );
    setQuoteId(newQuoteId);
    setQuote(newQuote);
    setKey(Date.now());
  };

  const shareLinkToTest = () => {
    copyTextToClipboard(`${window.location.origin}/quote/${quoteId}`);
  };

  return (
    <div className="RandomTypingTest">
      <BoundedTypingTest key={key} test={quote.text.split(" ")} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default RandomTypingTest;
