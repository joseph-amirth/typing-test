import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import VerticalSpacer from "src/common/VerticalSpacer";
import HorizontalSpacer from "src/common/HorizontalSpacer";
import { usePreference } from "src/context/preferences";
import QuoteTypingTest from "src/typingtests/quote/RandomTypingTest";
import TimeTypingTest from "src/typingtests/time/RandomTypingTest";
import WordsTypingTest from "src/typingtests/words/RandomTypingTest";
import "./RandomTypingTestView.css";

const RandomTypingTestView = () => {
  const [currentMode, setCurrentMode] = usePreference("currentMode");

  const handleCurrentModeChange = (event) => {
    const value = event.target.value;
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

const getTypingTestControls = (mode) => {
  switch (mode) {
    case "words":
      return <WordsTypingTestControls />;
    case "time":
      return <TimeTypingTestControls />;
    case "quote":
      return <QuoteTypingTestControls />;
    default:
  }
};

const getTypingTestView = (mode) => {
  switch (mode) {
    case "words":
      return <WordsTypingTestView />;
    case "time":
      return <TimeTypingTestView />;
    case "quote":
      return <QuoteTypingTestView />;
    default:
  }
};

const WordsTypingTestControls = () => {
  const [language, setLanguage] = usePreference("language");
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
      <HorizontalSpacer />
      <FormControl>
        <InputLabel id="Language">Language</InputLabel>
        <Select
          variant="outlined"
          labelId="Language"
          label="Language"
          value={language}
          onChange={handleLanguageChange}
        >
          <MenuItem value="english">Common english words</MenuItem>
          <MenuItem value="english1k">Uncommon english words</MenuItem>
        </Select>
      </FormControl>
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

  return <WordsTypingTest language={language} length={length} />;
};

const TimeTypingTestControls = () => {
  const [language, setLanguage] = usePreference("language");
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
      <HorizontalSpacer />
      <FormControl>
        <InputLabel id="Language">Language</InputLabel>
        <Select
          variant="outlined"
          labelId="Language"
          label="Language"
          value={language}
          onChange={handleLanguageChange}
        >
          <MenuItem value="english">Common english words</MenuItem>
          <MenuItem value="english1k">Uncommon english words</MenuItem>
        </Select>
      </FormControl>
      <HorizontalSpacer />
      <FormControl>
        <InputLabel id="Duration">Duration</InputLabel>
        <Select
          variant="outlined"
          labelId="Duration"
          label="Duration"
          value={duration}
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

  return <TimeTypingTest language={language} duration={duration} />;
};

const QuoteTypingTestControls = () => {
  const [length, setLength] = usePreference("quoteModeLength");

  const handleLengthChange = (event) => {
    const value = event.target.value;
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

  return <QuoteTypingTest length={length} />;
};

export default RandomTypingTestView;
