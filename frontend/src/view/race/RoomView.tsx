import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useService } from "../../service";
import { AccountService } from "../../service/account";
import { Button } from "@mui/material";

function RoomView() {
  const { room } = useParams();

  const { accountState } = useService(AccountService);
  const socket = useRef<WebSocket | null>(null);

  const [state, setState] = useState<State>({ kind: "notReady" });
  const [otherPlayers, setOtherPlayers] = useState<OtherPlayer[]>([]);

  const handleMessage = (msg: Msg) => {
    console.log(msg);

    const { kind, payload } = msg;

    switch (kind) {
      case "init":
        setOtherPlayers(
          payload.otherPlayerUsernames.map((username) => {
            return { username, state: "NotReady" };
          }),
        );
        break;
      case "join":
        setOtherPlayers((players) => [
          ...players,
          { username: payload.joiningPlayer, state: "NotReady" },
        ]);
        break;
      case "leave":
        setOtherPlayers((players) =>
          players.filter((player) => player.username != payload.leavingPlayer),
        );
        break;
      case "ready":
        setOtherPlayers((players) =>
          players.map((player) =>
            player.username == payload.readyPlayer
              ? { ...player, state: "Ready" }
              : player,
          ),
        );
        break;
      case "notReady":
        setOtherPlayers((players) =>
          players.map((player) =>
            player.username == payload.notReadyPlayer
              ? { ...player, state: "NotReady" }
              : player,
          ),
        );
        break;
      case "prepare":
        setState({
          kind: "ready",
          subState: {
            preparing: {
              timeUntilRaceStart: payload.timeUntilRaceStart,
            },
          },
        });
        const interval = setInterval(() => {
          setState((state) => {
            if (state.kind !== "ready") {
              return state;
            }
            const timeLeft =
              state.subState.preparing!.timeUntilRaceStart.secs - 1;
            if (timeLeft == 0) {
              clearInterval(interval);
            }
            return {
              kind: "ready",
              subState: {
                preparing: {
                  timeUntilRaceStart: {
                    secs: timeLeft,
                  },
                },
              },
            };
          });
        }, 1000);
        break;
    }
  };

  const sendReady = () => {
    if (socket.current === null) {
      return;
    }
    const msg = { kind: "ready", payload: {} };
    socket.current.send(JSON.stringify(msg));
    setState({ kind: "ready", subState: {} });
  };

  const sendNotReady = () => {
    if (socket.current === null) {
      return;
    }
    const msg = { kind: "notReady", payload: {} };
    socket.current.send(JSON.stringify(msg));
    setState({ kind: "notReady" });
  };

  useEffect(() => {
    if (accountState.state !== "signedin") {
      return;
    }
    socket.current = new WebSocket(
      `ws://localhost:8080/room/join?roomId=${room}`,
    );
    socket.current.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data) as Msg;
      handleMessage(msg);
    });
    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, [accountState]);

  if (accountState.state !== "signedin") {
    return (
      <div className="RoomView">Please sign in to participate in races.</div>
    );
  }

  return (
    <div className="RoomView">
      {state.kind === "notReady" && (
        <Button variant="contained" onClick={sendReady}>
          Ready
        </Button>
      )}
      {state.kind === "ready" &&
        (state.subState.preparing ? (
          `Race starts in ${state.subState.preparing.timeUntilRaceStart.secs} seconds`
        ) : (
          <Button variant="contained" onClick={sendNotReady}>
            NotReady
          </Button>
        ))}
      {otherPlayers.map((player, i) => (
        <div key={i}>
          {player.username} {player.state}
        </div>
      ))}
    </div>
  );
}

type State = NotReadyState | ReadyState;

interface NotReadyState {
  kind: "notReady";
}

interface ReadyState {
  kind: "ready";
  subState: {
    preparing?: {
      timeUntilRaceStart: { secs: number };
    };
  };
}

interface OtherPlayer {
  username: string;
  state: OtherPlayerState;
}

type OtherPlayerState = "NotReady" | "Ready";

type Msg = InitMsg | JoinMsg | LeaveMsg | ReadyMsg | NotReadyMsg | PrepareMsg;

interface InitMsg {
  kind: "init";
  payload: {
    otherPlayerUsernames: string[];
  };
}

interface JoinMsg {
  kind: "join";
  payload: {
    joiningPlayer: string;
  };
}

interface LeaveMsg {
  kind: "leave";
  payload: {
    leavingPlayer: string;
  };
}

interface ReadyMsg {
  kind: "ready";
  payload: {
    readyPlayer: string;
  };
}

interface NotReadyMsg {
  kind: "notReady";
  payload: {
    notReadyPlayer: string;
  };
}

interface PrepareMsg {
  kind: "prepare";
  payload: {
    timeUntilRaceStart: { secs: number };
  };
}

export default RoomView;
