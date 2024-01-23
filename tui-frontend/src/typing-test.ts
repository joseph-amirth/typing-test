import Diff from "./diff";
import { setInputCallback } from "./input";
import words from "./static/words.json";

function range(n: number): Array<number> {
  let array = [];
  for (let i = 0; i < n; i++) {
    array.push(i);
  }
  return array;
}

const randomWord = () => {
  return words[Math.floor(Math.random() * words.length)];
};

const randomWords = (count: number) => {
  return range(count).map(randomWord);
};

let test: string[] = [];
let attempt: string[] = "".split(" ");

function TypingTest(
  { isRerender, restartTest } = { isRerender: false, restartTest: false },
) {
  if (!isRerender) {
    if (!restartTest) {
      test = randomWords(100);
    }
    attempt = "".split(" ");
    setInputCallback((input: string) => {
      const newAttempt = input.split(" ");
      attempt = newAttempt;
      rerender();
    });
  }

  return $("<div></div>")
    .addClass("TypingTest")
    .append(Diff({ test, attempt }));
}

function rerender() {
  const prev = $(".TypingTest").prev();
  $(".TypingTest").remove();
  prev.after(TypingTest({ isRerender: true, restartTest: false }));
}

export default TypingTest;
