import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import VerticalSpacer from "../common/VerticalSpacer";
import HorizontalSpacer from "../common/HorizontalSpacer";
import {
  QuoteModeLength,
  TypingTestMode,
  usePreference,
} from "../context/preference";
import QuoteTypingTest from "../typing-test/quote/RandomTypingTest";
import TimeTypingTest from "../typing-test/time/RandomTypingTest";
import WordsTypingTest from "../typing-test/words/RandomTypingTest";
import "./RandomTypingTestView.css";
import { Language, languageList } from "../service/static-content";

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

  const handleLengthChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setLength(parseInt(value));
  };

  return (
    <>
      <HorizontalSpacer />
      <SelectLanguage />
      <HorizontalSpacer />
      <FormControl>
        <InputLabel id="Length">Length</InputLabel>
        <Select
          variant="outlined"
          labelId="Length"
          label="Length"
          value={length.toString()}
          onChange={handleLengthChange}
        >
          <MenuItem value={10}>10 words</MenuItem>
          <MenuItem value={20}>20 words</MenuItem>
          <MenuItem value={50}>50 words</MenuItem>
          <MenuItem value={100}>100 words</MenuItem>
        </Select>
      </FormControl>
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

  const handleDurationChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setDuration(parseInt(value));
  };

  return (
    <>
      <HorizontalSpacer />
      <SelectLanguage />
      <HorizontalSpacer />
      <FormControl>
        <InputLabel id="Duration">Duration</InputLabel>
        <Select
          variant="outlined"
          labelId="Duration"
          label="Duration"
          value={duration.toString()}
          onChange={handleDurationChange}
        >
          <MenuItem value={15}>15 seconds</MenuItem>
          <MenuItem value={30}>30 seconds</MenuItem>
          <MenuItem value={60}>60 seconds</MenuItem>
          <MenuItem value={120}>120 seconds</MenuItem>
        </Select>
      </FormControl>
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

  const handleLengthChange = (event: SelectChangeEvent) => {
    const value = event.target.value as QuoteModeLength;
    setLength(value);
  };

  return (
    <>
      <HorizontalSpacer />
      <FormControl>
        <InputLabel id="Length">Length</InputLabel>
        <Select
          variant="outlined"
          labelId="Length"
          label="Length"
          value={length}
          onChange={handleLengthChange}
        >
          <MenuItem value="short">Short</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="long">Long</MenuItem>
          <MenuItem value="veryLong">Very long</MenuItem>
          <MenuItem value="all">All</MenuItem>
        </Select>
      </FormControl>
    </>
  );
};

const QuoteTypingTestView = () => {
  const [length] = usePreference("quoteModeLength");

  return <QuoteTypingTest key={length} length={length} />;
};

function SelectLanguage() {
  const [language, setLanguage] = usePreference("language");

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const value = event.target.value as Language;
    setLanguage(value);
  };

  return (
    <FormControl>
      <InputLabel id="Language">Language</InputLabel>
      <Select
        variant="outlined"
        labelId="Language"
        label="Language"
        value={language}
        onChange={handleLanguageChange}
      >
        {languageList.map((language) => (
          <MenuItem key={language} value={language}>
            {language}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default RandomTypingTestView;
