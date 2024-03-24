import { IconButton, Switch, Tooltip } from "@mui/material";
import { usePreference } from "../service/preferences/hooks";
import { HelpOutline } from "@mui/icons-material";

function SettingsView() {
  return (
    <div className="Settings">
      <ShowAllLines />
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

export default SettingsView;
