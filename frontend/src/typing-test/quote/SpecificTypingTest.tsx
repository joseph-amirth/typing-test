import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { copyTextToClipboard } from "../../util/misc";
import BoundedTypingTest from "../BoundedTypingTest";
import Buttons from "./../Buttons";
import "./SpecificTypingTest.css";
import VerticalSpacer from "../../component/spacing/VerticalSpacer";
import { QuoteModeLength } from "../../service/preferences";
import { Quotes } from "../../service/staticcontent";
import { useQuotes } from "../../service/staticcontent/hooks";

const getQuote = (quotesInfo: Quotes, quoteId: number) => {
  return quotesInfo.quotes[quoteId].text.split(" ");
};

function SpecificTypingTest({
  length,
  id,
}: {
  length: QuoteModeLength;
  id: number;
}) {
  const quotes = useQuotes();
  if (quotes === undefined) {
    return;
  }

  return <Inner quotes={quotes} length={length} id={id} />;
}

function Inner({
  quotes,
  id,
}: {
  quotes: Quotes;
  length: QuoteModeLength;
  id: number;
}) {
  const navigate = useNavigate();

  const quote = getQuote(quotes, id);

  const [key, setKey] = useState(Date.now());

  const restartTest = () => {
    setKey(Date.now());
  };

  const nextTest = () => {
    navigate("/");
  };

  const shareLinkToTest = () => {
    copyTextToClipboard(window.location.href);
  };

  return (
    <div key={key} className="SpecificTypingTest">
      <BoundedTypingTest test={quote} />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
}

export default SpecificTypingTest;
