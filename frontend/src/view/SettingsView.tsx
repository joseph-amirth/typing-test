import { IconButton, Switch, Tooltip } from "@mui/material";
import { usePreference } from "../service/preferences/hooks";
import { HelpOutline } from "@mui/icons-material";

function SettingsView() {
  return (
    <div className="Settings">
      <ShowAllLines />
      <AllowSkippingWords />
      <AllowBackspacingWords />
    </div>
  );
}

function ShowAllLines() {
  const [showAllLines, setShowAllLines] = usePreference("showAllLines");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowAllLines(event.target.checked);
  };

  return (
    <div className="ShowAllLines">
      Show all lines
      <Tooltip title="Whether all lines of a test should be shown or not. Does not apply to timed tests.">
        <IconButton>
          <HelpOutline />
        </IconButton>
      </Tooltip>
      <Switch checked={showAllLines} onChange={handleChange} />
    </div>
  );
}

function AllowSkippingWords() {
  const [allowSkippingWords, setAllowSkippingWords] =
    usePreference("allowSkippingWords");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllowSkippingWords(event.target.checked);
  };

  return (
    <div className="AllowSkippingWords">
      Allow skipping words
      <Tooltip title="If enabled, words can be skipped in tests freely. If disabled, then all words must be typed correctly.">
        <IconButton>
          <HelpOutline />
        </IconButton>
      </Tooltip>
      <Switch checked={allowSkippingWords} onChange={handleChange} />
    </div>
  );
}

function AllowBackspacingWords() {
  const [allowBackspacingWords, setAllowBackspacingWords] = usePreference(
    "allowBackspacingWords",
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllowBackspacingWords(event.target.checked);
  };

  return (
    <div className="AllowBackspacingWords">
      Allow backspacing words
      <Tooltip title="If enabled, words can be backspaced freely. If disabled, then once a word is skipped, it cannot be revisited.">
        <IconButton>
          <HelpOutline />
        </IconButton>
      </Tooltip>
      <Switch checked={allowBackspacingWords} onChange={handleChange} />
    </div>
  );
}

export default SettingsView;
