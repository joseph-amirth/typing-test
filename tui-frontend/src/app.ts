import "./style/App.scss";
import "./style/Header.scss";
import Footer from "./footer";
import Input from "./input";
import TypingTest from "./typing-test";

type Mode = "control" | "insert";

type Callback<T> = (t: T) => void;

export let mode: Mode = "control";
const modeCallbacks = $.Callbacks();

export function setMode(newMode: Mode) {
  mode = newMode;
  modeCallbacks.fire(mode);
}

export function subscribeToModeUpdate(callback: Callback<Mode>) {
  modeCallbacks.add(callback);
}

function App(options = { restartTest: false }) {
  const handleKeyDown = (event: JQuery.Event) => {
    switch (mode) {
      case "control":
        if (event.key === "i") {
          setMode("insert");
          $(".Input").trigger("focus");
        } else if (event.key === "n") {
          rerender();
          $(".App").trigger("focus");
        } else if (event.key === "r") {
          setMode("insert");
          rerender({ restartTest: true });
          $(".Input").trigger("focus");
        }
        event.preventDefault();
        break;
      case "insert":
        if (event.key === "Escape") {
          setMode("control");
          $(".App").trigger("focus");
        }
        break;
    }
  };

  const handleClick = (event: JQuery.ClickEvent) => {
    if (mode === "control") {
      $(".App").trigger("focus");
    } else if (mode === "insert") {
      $(".Input").trigger("focus");
    }
  };

  return $("<div>")
    .addClass("App")
    .attr("tabIndex", 0)
    .on("keydown", handleKeyDown)
    .on("click", handleClick)
    .append(
      Input(),
      Header(),
      TypingTest({ ...options, isRerender: false }),
      Footer(),
    );
}

function rerender(options = { restartTest: false }) {
  $(".App").remove();
  $("body").append(App(options));
}

function Header() {
  return $("<div>")
    .addClass("Header")
    .append($("<div>").addClass("Title").text("Typing test"));
}

export default App;
