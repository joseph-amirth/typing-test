export function copyTextToClipboard(text: string) {
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.value = text;
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}
