import "./style/Footer.scss";
import { mode, subscribeToModeUpdate } from "./app";

function Footer({ isRerender } = { isRerender: false }) {
  if (!isRerender) {
    subscribeToModeUpdate(rerender);
  }

  const helps =
    mode === "control"
      ? [
          Help({ key: "i", action: "insert" }),
          Separator(),
          Help({ key: "r", action: "restart" }),
          Separator(),
          Help({ key: "n", action: "next" }),
        ]
      : [Help({ key: "Esc", action: "escape" })];

  return $("<div></div>")
    .addClass("Footer")
    .append(CurrentMode(), Separator(), ...helps);
}

function rerender() {
  $(".Footer").remove();
  $(".App").append(Footer({ isRerender: true }));
}

function CurrentMode() {
  return $("<div>").addClass("CurrentMode").text(mode);
}

function Help({ key, action }: { key: string; action: string }) {
  return $("<div></div>")
    .addClass("Help")
    .append(key, $("<div></div>").addClass("Desc").text(action));
}

function Separator() {
  return $("<div></div>").addClass("Separator").text("·");
}

export default Footer;
