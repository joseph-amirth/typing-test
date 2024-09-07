import { useEffect, useRef, useState } from "react";
import "./VimApp.css";
import BoundedTypingTest from "../typing-test/BoundedTypingTest";
import { InputHandle } from "../typing-test/Input";

const TEST =
  "Um, what is going on right now? I didn't ask for any of this. Could you please revert back to the original commit?";

function VimApp() {
  const inputRef = useRef<InputHandle>(null);

  const [focus, setFocus] = useState(false);

  console.log(focus);

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
        setFocus((focus) => {
          if (focus) {
            inputRef.current?.blur();
            event.preventDefault();
          }
          return false;
        });
        break;
      case "i":
        setFocus((focus) => {
          if (!focus) {
            inputRef.current?.focus();
            event.preventDefault();
          }
          return true;
        });
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="VimApp">
      <Header />
      <div className="Body">
        <BoundedTypingTest
          ref={inputRef}
          test={TEST.split(" ")}
          autoFocus={false}
        />
      </div>
      <Hints />
    </div>
  );
}

function Header() {
  return <div className="Header"></div>;
}

function Hints() {
  return (
    <div className="Hints">
      <Hint input="i" action="insert" />
      {" · "}
      <Hint input="r" action="restart" />
      {" · "}
      <Hint input="n" action="next" />
    </div>
  );
}

function Hint({ input, action }: { input: string; action: string }) {
  return (
    <span className="Hint">
      <span className="Key">{input}</span>{" "}
      <span className="Action">{action}</span>
    </span>
  );
}

export default VimApp;
