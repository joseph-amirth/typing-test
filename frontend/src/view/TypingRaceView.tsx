import { useContext, useEffect, useRef, useState } from "react";
import { User, UserContext } from "../context/user";
import BoundedTypingTest from "../typingtests/BoundedTypingTest";
import { randomWords } from "../typingtests/gen";
import { LinearProgress } from "@mui/material";
import { Seed } from "../util/prng";

const TEST_LENGTH = 20;

const TypingRaceView = () => {
  const { user } = useContext(UserContext);
  const socket = useRef<WebSocket | null>(null);

  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [state, setState] = useState("waiting");
  const [seed, setSeed] = useState<Seed | undefined>(undefined);

  const handleMessage = (msg: Msg) => {
    const { kind, payload } = msg;
    switch (kind) {
      case "joined":
        {
          const { username } = payload;
          setOpponents((opponents) => [
            ...opponents,
            { username, progress: 0 },
          ]);
        }
        break;
      case "start":
        {
          const { seed } = payload;
          setState("prepare");
          setSeed(seed);
          setTimeout(() => {
            setState("start");
          }, 5 * 1000);
        }
        break;
      case "update":
        {
          const opponent = payload;
          const { username } = opponent;
          setOpponents((opponents) => {
            const newOpponents = opponents.filter(
              (opponent) => opponent.username !== username,
            );
            newOpponents.push(opponent);
            return newOpponents;
          });
        }
        break;
      case "finish":
        {
          const { username, result } = payload;
          setOpponents((opponents) => {
            return opponents.filter(
              (opponent) => opponent.username !== username,
            );
          });
          setResults((results) => [...results, { username, result }]);
        }
        break;
    }
  };

  useEffect(() => {
    if (user === undefined) {
      return;
    }
    socket.current = new WebSocket("ws://localhost:8080/race");
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
  }, [user]);

  const [userProgress, setUserProgress] = useState(0);
  const [userResult, setUserResult] = useState<number | undefined>(undefined);

  if (user === undefined) {
    return (
      <div className="TypingRaceView">
        Please sign in to participate in races.
      </div>
    );
  }

  return (
    <div className="TypingRaceView">
      <div className="State">
        {state === "waiting" && "Waiting for more users..."}
        {state === "prepare" && "Race starting soon..."}
        {state === "start" && "Start!"}
      </div>
      <RaceProgress
        user={user!}
        userProgress={userProgress}
        userResult={userResult}
        opponents={opponents}
        results={results}
      />
      {state === "start" && (
        <BoundedTypingTest
          test={randomWords(seed!, "english", TEST_LENGTH)}
          options={{
            allowSkipping: false,
          }}
          onUpdate={(_, attempt) => {
            const userProgress = attempt.length - 1;
            setUserProgress(userProgress);
            const msg = JSON.stringify({
              kind: "update",
              payload: {
                username: user!.username,
                progress: userProgress,
              },
            });
            socket.current?.send(msg);
          }}
          onFinish={(_, duration) => {
            setUserResult(duration);
            setState("finish");
            const msg = JSON.stringify({
              kind: "finish",
              payload: {
                username: user!.username,
                result: duration,
              },
            });
            socket.current?.send(msg);
          }}
        />
      )}
    </div>
  );
};

const RaceProgress = ({
  user,
  userProgress,
  userResult,
  opponents,
  results,
}: {
  user: User;
  userProgress: number;
  userResult?: number;
  opponents: Opponent[];
  results: Result[];
}) => {
  let newResults = [...results];
  if (userResult !== undefined) {
    newResults.push({ username: user.username, result: userResult });
  }
  newResults.sort((a, b) => {
    if (a.result < b.result) {
      return -1;
    } else if (a.result > b.result) {
      return 1;
    }
    return 0;
  });

  return (
    <div className="RaceProgress">
      {newResults.map(({ username, result }, i) => {
        return (
          <div key={i} className="RaceResult">
            {i + 1} {username} {username === user.username && "(You)"} {result}
          </div>
        );
      })}
      {opponents.map(({ username, progress }) => {
        return (
          <div key={username} className="Opponent">
            {username}{" "}
            <LinearProgress
              variant="determinate"
              value={(progress / TEST_LENGTH) * 100}
            />
          </div>
        );
      })}
      {userResult === undefined && (
        <div className="User">
          {user.username}
          {"(You) "}
          <LinearProgress
            variant="determinate"
            value={(userProgress / TEST_LENGTH) * 100}
          />
        </div>
      )}
    </div>
  );
};

type Msg = JoinedMsg | StartMsg | UpdateMsg | FinishMsg;

interface JoinedMsg {
  kind: "joined";
  payload: {
    username: string;
  };
}

interface StartMsg {
  kind: "start";
  payload: {
    seed: Seed;
  };
}

interface UpdateMsg {
  kind: "update";
  payload: {
    username: string;
    progress: number;
  };
}

interface FinishMsg {
  kind: "finish";
  payload: {
    username: string;
    result: number;
  };
}

interface Opponent {
  username: string;
  progress: number;
}

interface Result {
  username: string;
  result: number;
}

export default TypingRaceView;
