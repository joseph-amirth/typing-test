import { Button, ButtonGroup } from "@mui/material";
import "./Buttons.css";

const Buttons = ({
  restart,
  next,
  share,
}: {
  restart: () => void;
  next: () => void;
  share: () => void;
}) => {
  return (
    <ButtonGroup>
      <Button onClick={next}>Next test</Button>
      <Button onClick={restart}>Restart</Button>
      <Button onClick={share}>Share link</Button>
    </ButtonGroup>
  );
};

export default Buttons;
