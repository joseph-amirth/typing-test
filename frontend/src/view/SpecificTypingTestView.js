import { useLoaderData } from "react-router-dom";
import WordsTypingTest from "../typingtests/words/SpecificTypingTest";
import TimeTypingTest from "../typingtests/time/SpecificTypingTest";

const SpecificTypingTestView = () => {
  const { mode, params } = useLoaderData();

  switch (mode) {
    case "words":
      return <WordsTypingTest {...params} />;
    case "time":
      return <TimeTypingTest {...params} />;
    default:
      return null;
  }
};

export default SpecificTypingTestView;
