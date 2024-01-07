import "./style/App.scss";
import Footer from "./Footer";
import Header from "./Header";
import TypingTest from "./TypingTest";
import { Action, useActionCallbacks } from "./context/action";

function App() {
  const { callbacks } = useActionCallbacks();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const action = mapKeyToAction(event.key);
    if (action === undefined) {
      return;
    }
    if (action.kind === "insert") {
      for (let callback of callbacks.insertCallbacks) {
        callback(action);
      }
    }
  };

  return (
    <div className="App" tabIndex={0} onKeyDown={handleKeyDown}>
      <Header />
      <TypingTest />
      <Footer />
    </div>
  );
}

function mapKeyToAction(key: string): Action | undefined {
  return { kind: "insert", letter: key };
}

export default App;
