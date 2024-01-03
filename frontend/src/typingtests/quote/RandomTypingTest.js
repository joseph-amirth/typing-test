import { useEffect, useState } from "react";
import VerticalSpacer from "../../common/VerticalSpacer";
import { copyTextToClipboard } from "../../util/misc";
import BoundedTypingTest from "../BoundedTypingTest";
import Buttons from "../Buttons";
import quotes from "../../res/quotes";

const getRandomQuote = ({ oldQuoteId } = {}) => {
  const nQuotes = quotes.length;
  let newQuoteId = Math.floor(Math.random() * nQuotes);
  if (oldQuoteId !== undefined) {
    while (newQuoteId === oldQuoteId) {
      newQuoteId = Math.floor(Math.random() * nQuotes);
    }
  }
  return { newQuoteId, newQuote: quotes[newQuoteId] };
};

const RandomTypingTest = () => {
  const [key, setKey] = useState(Date.now());
  const [quoteId, setQuoteId] = useState(-1);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const { newQuoteId, newQuote } = getRandomQuote();
    setQuoteId(newQuoteId);
    setQuote(newQuote);
  }, []);

  const restartTest = () => {
    setKey(Date.now());
  };

  const nextTest = () => {
    const { newQuoteId, newQuote } = getRandomQuote({ oldQuoteId: quoteId });
    setQuoteId(newQuoteId);
    setQuote(newQuote);
    setKey(Date.now());
  };

  const shareLinkToTest = () => {
    copyTextToClipboard(`${window.location.origin}/quote/${quoteId}`);
  };

  return (
    <div className="RandomTypingTest">
      <BoundedTypingTest key={key} test={quote.split(" ")} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default RandomTypingTest;
