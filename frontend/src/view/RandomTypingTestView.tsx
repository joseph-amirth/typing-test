import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import VerticalSpacer from "../component/spacing/VerticalSpacer";
import HorizontalSpacer from "../component/spacing/HorizontalSpacer";
import { QuoteModeLength, TypingTestMode } from "../service/preferences";
import { usePreference } from "../service/preferences/hooks";
import QuoteTypingTest from "../typing-test/quote/RandomTypingTest";
import TimeTypingTest from "../typing-test/time/RandomTypingTest";
import WordsTypingTest from "../typing-test/words/RandomTypingTest";
import "./RandomTypingTestView.css";
import { Language } from "../service/staticcontent";
import SelectWordsLength from "../component/input/SelectWordsLength";
import SelectLanguage from "../component/input/SelectLanguage";
import SelectTimeDuration from "../component/input/SelectTimeDuration";
import SelectQuoteLength from "../component/input/SelectQuoteLength";

const RandomTypingTestView = () => {
  const [currentMode, setCurrentMode] = usePreference("currentMode");

  const handleCurrentModeChange = (event: SelectChangeEvent) => {
    const value = event.target.value as TypingTestMode;
    setCurrentMode(value);
  };

  return (
    <div className="RandomTypingTestView">
      <div className="RandomTypingTestControls">
        <FormControl>
          <InputLabel id="Mode">Mode</InputLabel>
          <Select
            variant="outlined"
            labelId="Mode"
            label="Mode"
            value={currentMode}
            onChange={handleCurrentModeChange}
          >
            <MenuItem value="words">Words</MenuItem>
            <MenuItem value="time">Time</MenuItem>
            <MenuItem value="quote">Quote</MenuItem>
          </Select>
        </FormControl>
        {getTypingTestControls(currentMode)}
      </div>
      <VerticalSpacer />
      {getTypingTestView(currentMode)}
    </div>
  );
};

const getTypingTestControls = (mode: TypingTestMode) => {
  switch (mode) {
    case "words":
      return <WordsTypingTestControls />;
    case "time":
      return <TimeTypingTestControls />;
    case "quote":
      return <QuoteTypingTestControls />;
  }
};

const getTypingTestView = (mode: TypingTestMode) => {
  switch (mode) {
    case "words":
      return <WordsTypingTestView />;
    case "time":
      return <TimeTypingTestView />;
    case "quote":
      return <QuoteTypingTestView />;
  }
};

const WordsTypingTestControls = () => {
  const [length, setLength] = usePreference("wordsModeLength");

  const handleLengthChange = (length: number) => {
    setLength(length);
  };

  return (
    <>
      <HorizontalSpacer />
      <SelectLanguagePreference />
      <HorizontalSpacer />
      <SelectWordsLength length={length} onLengthChange={handleLengthChange} />
    </>
  );
};

const WordsTypingTestView = () => {
  const [language] = usePreference("language");
  const [length] = usePreference("wordsModeLength");

  return (
    <WordsTypingTest
      key={language + " " + length}
      language={language}
      length={length}
    />
  );
};

const TimeTypingTestControls = () => {
  const [duration, setDuration] = usePreference("timeModeDuration");

  const handleDurationChange = (duration: number) => {
    setDuration(duration);
  };

  return (
    <>
      <HorizontalSpacer />
      <SelectLanguagePreference />
      <HorizontalSpacer />
      <SelectTimeDuration
        duration={duration}
        onDurationChange={handleDurationChange}
      />
    </>
  );
};

const TimeTypingTestView = () => {
  const [language] = usePreference("language");
  const [duration] = usePreference("timeModeDuration");

  return (
    <TimeTypingTest
      key={language + " " + duration}
      language={language}
      duration={duration}
    />
  );
};

const QuoteTypingTestControls = () => {
  const [length, setLength] = usePreference("quoteModeLength");

  const handleLengthChange = (length: QuoteModeLength) => {
    setLength(length);
  };

  return (
    <>
      <HorizontalSpacer />
      <SelectQuoteLength length={length} onLengthChange={handleLengthChange} />
    </>
  );
};

const QuoteTypingTestView = () => {
  const [length] = usePreference("quoteModeLength");

  return <QuoteTypingTest key={length} length={length} />;
};

function SelectLanguagePreference() {
  const [language, setLanguage] = usePreference("language");

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
  };

  return (
    <SelectLanguage
      language={language}
      onLanguageChange={handleLanguageChange}
    />
  );
}

export default RandomTypingTestView;
