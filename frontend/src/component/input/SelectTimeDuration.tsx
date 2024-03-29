import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { timeDurations } from "../../service/preferences";

function SelectTimeDuration({
  duration,
  onDurationChange,
}: {
  duration: number;
  onDurationChange: (duration: number) => void;
}) {
  const handleDurationChange = (event: SelectChangeEvent) => {
    onDurationChange(parseInt(event.target.value));
  };

  return (
    <FormControl>
      <InputLabel id="Duration">Duration</InputLabel>
      <Select
        variant="outlined"
        labelId="Duration"
        label="Duration"
        value={duration.toString()}
        onChange={handleDurationChange}
      >
        {timeDurations.map((duration) => (
          <MenuItem value={duration}>{duration} seconds</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default SelectTimeDuration;
