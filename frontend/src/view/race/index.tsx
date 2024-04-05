import { Button } from "@mui/material";
import "./index.css";
import { useNavigate } from "react-router-dom";

function RaceHomeView() {
  return (
    <div className="RaceHomeView">
      <Menu />
    </div>
  );
}

function Menu() {
  const navigate = useNavigate();

  const createRoom = () => {};

  return (
    <div className="Menu">
      <MenuButton onClick={() => navigate("/race/public")}>Race</MenuButton>
      <MenuButton onClick={createRoom}>Create room</MenuButton>
    </div>
  );
}

function MenuButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: React.MouseEventHandler;
}) {
  return (
    <Button variant="contained" className="MenuButton" onClick={onClick}>
      {children}
    </Button>
  );
}

export default RaceHomeView;
