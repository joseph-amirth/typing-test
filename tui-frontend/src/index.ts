import "./style/App.scss";
import { square } from "./math";

function component() {
  const element = document.createElement("div");
  element.innerHTML = "Hello webpack";
  element.classList.add("App");
  element.innerHTML += square(10);
  return element;
}

document.body.appendChild(component());
