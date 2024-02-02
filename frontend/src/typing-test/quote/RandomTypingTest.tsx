import { useState } from "react";
import VerticalSpacer from "../../common/VerticalSpacer";
import { copyTextToClipboard } from "../../util/misc";
import BoundedTypingTest from "../BoundedTypingTest";
import Buttons from "../Buttons";
import quotesInfo from "../../static/quotes.json";
import { randomInt } from "../../util/math";
import { QuoteModeLength } from "../../context/preference";

function RandomTypingTest({ length }: { length: QuoteModeLength }) {
  const [firstQuoteId, firstQuote] = getRandomQuote(length);

  const [quoteId, setQuoteId] = useState(firstQuoteId);
  const [quote, setQuote] = useState(firstQuote);
  const [key, setKey] = useState(Date.now());

  const restartTest = () => {
    setKey(Date.now());
  };

  const nextTest = () => {
    const [newQuoteId, newQuote] = getRandomQuote(
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
      <BoundedTypingTest key={key} test={quote} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
}

function getRandomQuote(
  length: QuoteModeLength,
  oldQuoteId: number | undefined = undefined,
): [number, string[]] {
  const [first, last] = quotesInfo[length] as [number, number];
  const quotes = quotesInfo.quotes;

  let newQuoteId = randomInt(first, last);
  if (oldQuoteId !== undefined) {
    while (newQuoteId === oldQuoteId) {
      newQuoteId = randomInt(first, last);
    }
  }
  return [newQuoteId, quotes[newQuoteId].text.split(" ")];
}

export default RandomTypingTest;
