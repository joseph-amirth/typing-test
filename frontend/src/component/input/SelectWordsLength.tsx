import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { wordsLengths } from "../../service/preferences";

function SelectWordsLength({
  length,
  onLengthChange,
}: {
  length: number;
  onLengthChange: (length: number) => void;
}) {
  const handleLengthChange = (event: SelectChangeEvent) => {
    onLengthChange(parseInt(event.target.value));
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
        {wordsLengths.map((length) => (
          <MenuItem value={length}>{length} words</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default SelectWordsLength;
