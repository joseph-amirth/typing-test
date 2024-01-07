import "./style/TypingTest.scss";
import words from "./static/words.json";
import Diff from "./Diff";
import { useContext } from "react";
import { ActionContext, InsertAction } from "./context/action";

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
  return range(count).map(() => randomWord());
};

const TypingTest = () => {
  const test = randomWords(100);

  const { registerInsertCallback } = useContext(ActionContext);

  registerInsertCallback((action: InsertAction) => {
    console.log(action.letter);
  });

  return (
    <div className="TypingTest">
      <Diff test={test} attempt={["whatinthe", "the", "w", "fuckoff"]} />
    </div>
  );
};

export default TypingTest;
