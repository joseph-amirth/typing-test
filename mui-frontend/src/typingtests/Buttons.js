import { Button, ButtonGroup } from "@mui/material";
import "./Buttons.css";

const Buttons = ({ restart, next, share }) => {
  return (
    <ButtonGroup>
      <Button onClick={restart}>Restart</Button>
      <Button onClick={next}>Next test</Button>
      <Button onClick={share}>Share link</Button>
    </ButtonGroup>
  );
};

export default Buttons;
