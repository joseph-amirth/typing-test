import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { copyTextToClipboard } from "../../util/misc";
import BoundedTypingTest from "../BoundedTypingTest";
import Buttons from "./../Buttons";
import quotesInfo from "../../static/quotes.json";
import "./SpecificTypingTest.css";
import VerticalSpacer from "../../common/VerticalSpacer";

const getQuote = (quoteId: number) => {
  return quotesInfo.quotes[quoteId].text;
};

const SpecificTypingTest = () => {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };

  const quote = getQuote(parseInt(id));

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
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
};

export default SpecificTypingTest;
