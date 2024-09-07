import { Button } from "@mui/material";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { useService } from "../../service";
import { ServerService } from "../../service/server";
import { useState } from "react";

function RaceHomeView() {
  return (
    <div className="RaceHomeView">
      <Menu />
    </div>
  );
}

function Menu() {
  const navigate = useNavigate();
  const { post } = useService(ServerService);

  const [roomCreationFailure, setRoomCreationFailure] = useState<string | null>(
    null,
  );

  const createRoom = () => {
    post<{ roomId: number }>(
      "/room/create",
      {},
      { credentials: "include" },
    ).then((response) => {
      switch (response.status) {
        case "ok":
          const { roomId } = response.body;
          navigate(`/race/room/${roomId}`);
          break;
        case "err":
          setRoomCreationFailure(response.reason);
          break;
        case "fail":
          setRoomCreationFailure("Unexpected failure while creating a room");
      }
    });
  };

  return (
    <div className="Menu">
      <MenuButton onClick={() => navigate("/race/public")}>Race</MenuButton>
      <MenuButton onClick={createRoom}>Create room</MenuButton>
      {roomCreationFailure !== null && roomCreationFailure}
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
