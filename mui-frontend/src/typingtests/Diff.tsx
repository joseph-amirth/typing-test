import { useRef } from "react";
import { disableCutCopyPasteProps } from "../util/component";
import "./Diff.css";

const Diff = ({
  test,
  attempt,
  showAllLines,
}: {
  test: string[];
  attempt: string[];
  showAllLines: boolean;
}) => {
  const diffDiv = useRef<HTMLDivElement>(null);

  const diffWords = getDiffWords(test, attempt);

  if (showAllLines) {
    return (
      <div className="Diff">
        {diffWords.map((word, i) => (
          <DiffWord key={i} {...word} />
        ))}
      </div>
    );
  } else {
    return (
      <div
        className="Diff"
        style={{ height: "3lh", overflow: "hidden" }}
        ref={diffDiv}
        {...disableCutCopyPasteProps()}
      >
        {diffWords.map((word, i) => (
          <DiffWord key={i} {...word} />
        ))}
      </div>
    );
  }
};

interface DiffLetterProps {
  letter: string;
  state: "Untyped" | "Correct" | "Wrong" | "Extra";
}

interface DiffWordProps {
  letters: DiffLetterProps[];
  skipped: boolean;
  focused: boolean;
}

const Caret = ({ offset }: { offset: number }) => {
  return (
    <div
      className="Caret"
      style={{
        top: "0px",
        left: `${offset}ch`,
      }}
    ></div>
  );
};

const DiffLetter = ({ letter, state }: DiffLetterProps) => {
  return <span className={`Letter ${state}`}>{letter}</span>;
};

const DiffWord = ({ letters, skipped, focused }: DiffWordProps) => {
  return (
    <span className={`Word ${skipped ? "Skipped" : ""}`}>
      {focused && (
        <Caret
          offset={1 + letters.findLastIndex(({ state }) => state !== "Untyped")}
        />
      )}
      {letters.map((diffLetterProps, i) => (
        <DiffLetter key={i} {...diffLetterProps} />
      ))}
    </span>
  );
};

function getDiffWords(test: string[], attempt: string[]): DiffWordProps[] {
  const diffWords: DiffWordProps[] = [];

  for (
    let i = 0;
    i + Number(attempt.length > test.length) < attempt.length;
    i++
  ) {
    const word = test[i];
    const attemptedWord = attempt[i];

    const minLength = Math.min(word.length, attemptedWord.length);
    const maxLength = Math.max(word.length, attemptedWord.length);

    const letters: DiffLetterProps[] = [];

    for (let j = 0; j < minLength; j++) {
      letters.push({
        letter: word[j],
        state: word[j] === attemptedWord[j] ? "Correct" : "Wrong",
      });
    }

    if (word.length < attemptedWord.length) {
      for (let j = minLength; j < maxLength; j++) {
        letters.push({ letter: attemptedWord[j], state: "Extra" });
      }
    } else if (word.length > attemptedWord.length) {
      for (let j = minLength; j < maxLength; j++) {
        letters.push({
          letter: word[j],
          state: "Untyped",
        });
      }
    }

    const focused = i + 1 === attempt.length;
    const skipped =
      !focused && letters.some(({ state }) => state !== "Correct");
    diffWords.push({ letters, skipped, focused });
    diffWords.push({
      letters: [{ letter: " ", state: "Untyped" }],
      skipped: false,
      focused: false,
    });
  }

  for (let i = attempt.length; i < test.length; i++) {
    const word = test[i];
    const letters: DiffLetterProps[] = [];
    for (const letter of word) {
      letters.push({ letter, state: "Untyped" });
    }
    diffWords.push({ letters, skipped: false, focused: false });
    diffWords.push({
      letters: [{ letter: " ", state: "Untyped" }],
      skipped: false,
      focused: false,
    });
  }

  return diffWords;
}

export default Diff;
