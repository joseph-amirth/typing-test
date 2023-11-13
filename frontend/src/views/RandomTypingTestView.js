import WordsTypingTest from "../typingtests/words/RandomTypingTest";
import TimeTypingTest from "../typingtests/time/RandomTypingTest";
import { usePreference } from "../preferences";
import VerticalSpacer from "../components/VerticalSpacer";
import HorizontalSpacer from "../components/HorizontalSpacer";

import "./RandomTypingTestView.css";

const RandomTypingTestView = () => {
  const [mode, setCurrentMode] = usePreference("mode");

  const handleCurrentModeChange = (event) => {
    const value = event.target.value;
    setCurrentMode(value);
  };

  return (
    <div className="TypingTestView">
      <div className="ModeChoice">
        <select value={mode} onChange={handleCurrentModeChange}>
          <option value="words">Words</option>
          <option value="time">Time</option>
          <option value="quote">Quote</option>
        </select>
      </div>
      <VerticalSpacer />
      {getTypingTest(mode)}
    </div>
  );
};

const getTypingTest = (mode) => {
  switch (mode) {
    case "words":
      return <WordsTypingTestView />;
    case "time":
      return <TimeTypingTestView />;
    default:
  }
};

const WordsTypingTestView = () => {
  const [language, setLanguage] = usePreference("wordsModeLanguage");
  const [length, setLength] = usePreference("wordsModeLength");

  const handleLanguageChange = (event) => {
    const value = event.target.value;
    setLanguage(value);
  };

  const handleLengthChange = (event) => {
    const value = event.target.value;
    setLength(parseInt(value));
  };

  return (
    <>
      <div className="ModeControls">
        <select value={language} onChange={handleLanguageChange}>
          <option value="english">Common english words</option>
          <option value="english1k">Uncommon english words</option>
        </select>
        <HorizontalSpacer />
        <select value={length} onChange={handleLengthChange}>
          <option value={10}>10 words</option>
          <option value={20}>20 words</option>
          <option value={50}>50 words</option>
          <option value={100}>100 words</option>
        </select>
      </div>
      <VerticalSpacer />
      <WordsTypingTest
        key={language + " " + length}
        language={language}
        length={length}
      />
    </>
  );
};

const TimeTypingTestView = () => {
  const [language, setLanguage] = usePreference("timeModeLanguage");
  const [duration, setDuration] = usePreference("timeModeDuration");

  const handleLanguageChange = (event) => {
    const value = event.target.value;
    setLanguage(value);
  };

  const handleDurationChange = (event) => {
    const value = event.target.value;
    setDuration(parseInt(value));
  };

  return (
    <>
      <div className="ModeControls">
        <select value={language} onChange={handleLanguageChange}>
          <option value="english">Common english words</option>
          <option value="english1k">Uncommon english words</option>
        </select>
        <HorizontalSpacer />
        <select value={duration} onChange={handleDurationChange}>
          <option value={15}>15 seconds</option>
          <option value={30}>30 seconds</option>
          <option value={60}>60 seconds</option>
          <option value={120}>120 seconds</option>
        </select>
      </div>
      <VerticalSpacer />
      <TimeTypingTest
        key={language + " " + duration}
        language={language}
        duration={duration}
      />
    </>
  );
};

export default RandomTypingTestView;
