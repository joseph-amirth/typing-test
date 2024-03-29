import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { QuoteModeLength, quoteLengths } from "../../service/preferences";

function SelectQuoteLength({
  length,
  onLengthChange,
}: {
  length: QuoteModeLength;
  onLengthChange: (length: QuoteModeLength) => void;
}) {
  const handleLengthChange = (event: SelectChangeEvent) => {
    onLengthChange(event.target.value as QuoteModeLength);
  };

  return (
    <FormControl>
      <InputLabel id="Length">Length</InputLabel>
      <Select
        variant="outlined"
        labelId="Length"
        label="Length"
        value={length.toString()}
        onChange={handleLengthChange}
      >
        {quoteLengths.map((length) => (
          <MenuItem value={length}>{length}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default SelectQuoteLength;
