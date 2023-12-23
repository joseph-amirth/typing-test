export const copyTextToClipboard = (text) => {
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.value = text;
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
};

export const pascalCaseToSpaceSeparated = (text) => {
  let words = text.replaceAll(/([a-z])([A-Z])/g, "$1 $2").split(" ");
  words = words.map((word) => word.toLowerCase());
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ");
};
