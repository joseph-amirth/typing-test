import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { copyTextToClipboard } from "../../util/misc";
import BoundedTypingTest from "../BoundedTypingTest";
import Buttons from "./../Buttons";
import quotesInfo from "../../static/quotes.json";

const getQuote = (quoteId) => {
  return quotesInfo.quotes[quoteId].text;
};

const SpecificTypingTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const quote = getQuote(id);

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
      <BoundedTypingTest test={quote.split(" ")} />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default SpecificTypingTest;
