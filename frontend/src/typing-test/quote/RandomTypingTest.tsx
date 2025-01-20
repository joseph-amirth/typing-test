import { useState } from "react";
import VerticalSpacer from "../../component/spacing/VerticalSpacer";
import { copyTextToClipboard } from "../../util/misc";
import BoundedTypingTest from "../BoundedTypingTest";
import Buttons from "../Buttons";
import { randomInt } from "../../util/math";
import { QuoteModeLength } from "../../service/preferences";
import { Quotes } from "../../service/staticcontent";
import { useQuotes } from "../../service/staticcontent/hooks";
import { TestFinishEvent } from "../props";
import { useService } from "../../service";
import { ResultsService } from "../../service/results";
import { REPEATED_TEST_NOTIFICATION } from "../../service/notifications/constants";
import { NotificationsService } from "../../service/notifications";

function RandomTypingTest({ length }: { length: QuoteModeLength }) {
  const quotes = useQuotes();
  if (quotes === undefined) {
    return;
  }

  return <Inner quotes={quotes} length={length} />;
}

function Inner({
  quotes,
  length,
}: {
  quotes: Quotes;
  length: QuoteModeLength;
}) {
  const resultsService = useService(ResultsService);
  const notificationsService = useService(NotificationsService);

  const [firstQuoteId, firstQuote] = getRandomQuote(quotes, length);

  const [quoteId, setQuoteId] = useState(firstQuoteId);
  const [quote, setQuote] = useState(firstQuote);
  const [key, setKey] = useState(Date.now());
  const [restarted, setRestarted] = useState(false);

  const nextTest = () => {
    const [newQuoteId, newQuote] = getRandomQuote(
      quotes,
      length,
      /* oldQuoteId= */ quoteId,
    );
    setQuoteId(newQuoteId);
    setQuote(newQuote);
    setKey(Date.now());
    setRestarted(false);
  };

  const restartTest = () => {
    setRestarted(false);
    setKey(Date.now());
    setRestarted(true);
  };

  const shareLinkToTest = () => {
    copyTextToClipboard(`${window.location.origin}/quote/${quoteId}`);
  };

  const handleTestFinish = (event: TestFinishEvent) => {
    if (restarted) {
      notificationsService.addNotification(REPEATED_TEST_NOTIFICATION);
      return;
    }
    const { wpm, rawWpm, accuracy } = event;
    resultsService.reportResult({
      testParams: {
        mode: "quote",
        params: {
          length,
        },
      },
      testCompletedTimestamp: Date.now(),
      wpm,
      rawWpm,
      accuracy,
    });
  };

  return (
    <div className="RandomTypingTest">
      <BoundedTypingTest
        key={key}
        test={quote}
        onTestFinish={handleTestFinish}
      />
      <VerticalSpacer />
      <Buttons restart={restartTest} next={nextTest} share={shareLinkToTest} />
    </div>
  );
}

function getRandomQuote(
  quotesInfo: Quotes,
  length: QuoteModeLength,
  oldQuoteId: number | undefined = undefined,
): [number, string[]] {
  const [first, last] = quotesInfo[length];
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
