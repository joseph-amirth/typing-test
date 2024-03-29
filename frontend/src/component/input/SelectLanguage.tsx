import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { Language, languageList } from "../../service/staticcontent";

function SelectLanguage({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const handleLanguageChange = (event: SelectChangeEvent) => {
    const value = event.target.value as Language;
    onLanguageChange(value);
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

export default SelectLanguage;
