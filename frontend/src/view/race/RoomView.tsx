import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useService } from "../../service";
import { AccountService } from "../../service/account";
import { Button } from "@mui/material";
import BoundedTypingTest from "../../typing-test/BoundedTypingTest";
import { TestFinishEvent } from "../../typing-test/props";
import { NotificationsService } from "../../service/notifications";
import { Seed } from "../../util/prng";
import { randomWords } from "../../typing-test/gen";
import english from "../../static/words/english.json";

const TEST_LENGTH = 10;

function RoomView() {
  const { room } = useParams();

  const { addNotification } = useService(NotificationsService);
  const { accountState } = useService(AccountService);
  const socket = useRef<WebSocket | null>(null);

  const [isHost, setIsHost] = useState(false);
  const [state, setState] = useState<State>({ kind: "notReady" });
  const [otherPlayers, setOtherPlayers] = useState<OtherPlayer[]>([]);

  const handleMessage = (msg: Msg) => {
    console.log(msg);

    const { kind, payload } = msg;

    switch (kind) {
      case "init":
        setIsHost(payload.isHost);
        setOtherPlayers(
          payload.otherPlayers.map(({ username, state }) => {
            return { username, state: { kind: state } };
          }),
        );
        break;
      case "join":
        setOtherPlayers((players) => [
          ...players,
          { username: payload.joiningPlayer, state: { kind: "notReady" } },
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
              ? { ...player, state: { kind: "ready" } }
              : player,
          ),
        );
        break;
      case "notReady":
        setOtherPlayers((players) =>
          players.map((player) =>
            player.username == payload.notReadyPlayer
              ? { ...player, state: { kind: "notReady" } }
              : player,
          ),
        );
        break;
      case "prepare":
        setState({
          kind: "preparing",
          ...payload,
        });
        const interval = setInterval(() => {
          setState((state) => {
            if (state.kind !== "preparing") {
              return state;
            }
            const timeLeft = state.timeUntilRaceStart.secs - 1;
            if (timeLeft == 0) {
              setState({ kind: "racing", seed: state.seed });
              setOtherPlayers((otherPlayers) =>
                otherPlayers.map((otherPlayer) => {
                  return {
                    ...otherPlayer,
                    state: { kind: "racing", progress: 0 },
                  };
                }),
              );
              clearInterval(interval);
            }
            return { ...state, timeUntilRaceStart: { secs: timeLeft } };
          });
        }, 1000);
        break;
      case "update":
        const { player: updatingPlayer, progress } = payload;
        setOtherPlayers((otherPlayers) => {
          const index = otherPlayers.findIndex(
            (otherPlayer) => otherPlayer.username === updatingPlayer,
          );
          return otherPlayers.with(index, {
            username: updatingPlayer,
            state: { kind: "racing", progress },
          });
        });
        break;
      case "finish":
        const { player: finishedPlayer, duration } = payload;
        setOtherPlayers((otherPlayers) => {
          const index = otherPlayers.findIndex(
            (otherPlayer) => otherPlayer.username === finishedPlayer,
          );
          return otherPlayers.with(index, {
            username: finishedPlayer,
            state: { kind: "finished", duration },
          });
        });
        break;
      case "error":
        const { title, body } = payload;
        addNotification({ type: "Error", title, body });
        break;
    }
  };

  const sendReady = () => {
    if (socket.current === null) {
      return;
    }
    const msg = { kind: "ready", payload: {} };
    socket.current.send(JSON.stringify(msg));
    setState({ kind: "ready" });
  };

  const sendNotReady = () => {
    if (socket.current === null) {
      return;
    }
    const msg = { kind: "notReady", payload: {} };
    socket.current.send(JSON.stringify(msg));
    setState({ kind: "notReady" });
  };

  const sendStart = () => {
    if (socket.current === null) {
      return;
    }
    const msg = { kind: "start", payload: {} };
    socket.current.send(JSON.stringify(msg));
  };

  const handleTestUpdate = (attempt: string[], newAttempt: string[]) => {
    if (socket.current === null || attempt.length === newAttempt.length) {
      return;
    }
    const msg = {
      kind: "update",
      payload: { progress: newAttempt.length - 1 },
    };
    socket.current.send(JSON.stringify(msg));
  };

  const handleTestFinish = (event: TestFinishEvent) => {
    if (socket.current === null) {
      return;
    }
    const { duration } = event;
    const msg = {
      kind: "finish",
      payload: {
        duration: {
          secs: Math.floor(duration),
          nanos: Math.floor(duration * 1_000_000_000) % 1_000_000_000,
        },
      },
    };
    socket.current.send(JSON.stringify(msg));
    setState({
      kind: "finished",
      duration: {
        secs: Math.floor(duration),
        nanos: Math.floor(duration * 1_000_000_000) % 1_000_000_000,
      },
    });
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
      {state.kind === "ready" && (
        <>
          <Button variant="contained" onClick={sendNotReady}>
            NotReady
          </Button>
          {isHost && (
            <Button variant="contained" onClick={sendStart}>
              Start
            </Button>
          )}
        </>
      )}
      {state.kind === "preparing" &&
        `Race starts in ${state.timeUntilRaceStart.secs} seconds`}
      {(state.kind === "ready" || state.kind === "notReady") &&
        otherPlayers.map((player, i) => (
          <div key={i}>
            {player.username} {player.state.kind}
          </div>
        ))}
      {state.kind === "racing" && (
        <BoundedTypingTest
          test={randomWords(state.seed, english, TEST_LENGTH)}
          onTestUpdate={handleTestUpdate}
          onTestFinish={handleTestFinish}
          allowSkippingWords={false}
        />
      )}
      {state.kind === "finished" && (
        <>
          You finished the race in{" "}
          {state.duration.secs + state.duration.nanos / 1_000_000_000} seconds!
          {otherPlayers.map(({ username, state }, i) => (
            <div key={i}>
              {username} {state.kind === "racing" && state.progress}
              {state.kind === "finished" &&
                `Finished in ${
                  state.duration.secs + state.duration.nanos / 1_000_000_000
                }`}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

type State =
  | { kind: "notReady" }
  | { kind: "ready" }
  | { kind: "preparing"; timeUntilRaceStart: { secs: number }; seed: Seed }
  | { kind: "racing"; seed: Seed }
  | { kind: "finished"; duration: { secs: number; nanos: number } };

type OtherPlayerState =
  | { kind: "notReady" }
  | { kind: "ready" }
  | { kind: "racing"; progress: number }
  | { kind: "finished"; duration: { secs: number; nanos: number } };

interface OtherPlayer {
  username: string;
  state: OtherPlayerState;
}

type Msg =
  | InitMsg
  | JoinMsg
  | LeaveMsg
  | ReadyMsg
  | NotReadyMsg
  | PrepareMsg
  | UpdateMsg
  | FinishMsg
  | ErrorMsg;

interface InitMsg {
  kind: "init";
  payload: {
    isHost: boolean;
    otherPlayers: {
      username: string;
      state: "notReady" | "ready";
    }[];
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
    seed: Seed;
  };
}

interface UpdateMsg {
  kind: "update";
  payload: {
    player: string;
    progress: number;
  };
}

interface FinishMsg {
  kind: "finish";
  payload: {
    player: string;
    duration: { secs: number; nanos: number };
  };
}

interface ErrorMsg {
  kind: "error";
  payload: {
    title: string;
    body: string;
  };
}

export default RoomView;
