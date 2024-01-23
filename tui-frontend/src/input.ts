type InputCallback = (input: string) => void;

let inputCallback: InputCallback | undefined = undefined;

export function setInputCallback(callback: InputCallback) {
  inputCallback = callback;
}

function Input() {
  return $("<input />")
    .attr("type", "text")
    .attr("tabindex", -1)
    .addClass("Input")
    .on("input", (event: JQuery.ChangeEvent) => {
      if (inputCallback !== undefined) {
        inputCallback(event.target.value);
      }
    });
}

export default Input;
