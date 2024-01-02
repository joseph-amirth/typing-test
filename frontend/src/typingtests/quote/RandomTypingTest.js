import { useEffect, useState } from "react";
import VerticalSpacer from "../../common/VerticalSpacer";
import { getRandomQuote } from "../../util/backend";
import { copyTextToClipboard } from "../../util/misc";
import BoundedTypingTest from "../BoundedTypingTest";
import Buttons from "../Buttons";

const RandomTypingTest = () => {
  const [key, setKey] = useState(Date.now());
  const [quoteId, setQuoteId] = useState("");
  const [quote, setQuote] = useState("");

  useEffect(() => {
    getRandomQuote().then(({ quoteId, quote }) => {
      setQuoteId(quoteId);
      setQuote(quote);
    });
  }, []);

  const restartTest = () => {
    setKey(Date.now());
  };

  const nextTest = () => {
    getRandomQuote(/* oldQuoteId= */ quoteId).then(({ quoteId, quote }) => {
      setQuoteId(quoteId);
      setQuote(quote);
      setKey(Date.now());
    });
  };

  const shareLinkToTest = () => {
    // TODO: Make this link work.
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
