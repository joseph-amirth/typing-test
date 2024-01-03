import WordsTypingTest from "../typingtests/words/RandomTypingTest";
import TimeTypingTest from "../typingtests/time/RandomTypingTest";
import QuoteTypingTest from "../typingtests/quote/RandomTypingTest";
import { usePreference } from "../context/preferences";
import VerticalSpacer from "../common/VerticalSpacer";
import HorizontalSpacer from "../common/HorizontalSpacer";
import "./RandomTypingTestView.css";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";

const RandomTypingTestView = () => {
  const [currentMode, setCurrentMode] = usePreference("currentMode");

  const handleCurrentModeChange = (event) => {
    const value = event.target.value;
    setCurrentMode(value);
  };

  return (
    <div className="TypingTestView">
      <div className="ModeChoice">
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
      </div>
      <VerticalSpacer />
      {getTypingTest(currentMode)}
    </div>
  );
};

const getTypingTest = (mode) => {
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

const WordsTypingTestView = () => {
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
      <div className="ModeControls">
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
      </div>
      <VerticalSpacer />
      <WordsTypingTest language={language} length={length} />
    </>
  );
};

const TimeTypingTestView = () => {
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
      <div className="ModeControls">
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
      </div>
      <VerticalSpacer />
      <TimeTypingTest language={language} duration={duration} />
    </>
  );
};

const QuoteTypingTestView = () => {
  const [length, setLength] = usePreference("quoteModeLength");

  const handleLengthChange = (event) => {
    const value = event.target.value;
    setLength(value);
  };

  return (
    <>
      <div className="ModeControls">
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
      </div>
      <VerticalSpacer />
      <QuoteTypingTest length={length} />
    </>
  );
};

export default RandomTypingTestView;
