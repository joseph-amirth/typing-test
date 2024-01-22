import { useEffect, useLayoutEffect, useRef } from "react";
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
  const diffWords = getDiffWords(test, attempt);

  const diffRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);

  // Scroll lines and position caret appropriately on resize.
  useEffect(() => {
    if (showAllLines || diffRef.current === null || caretRef.current === null) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      const diff = diffRef.current!;
      const caret = caretRef.current!;

      const diffTop = diff.getBoundingClientRect().top;
      const caretTop = caret.getBoundingClientRect().top;

      syncScrollingWithCaret(diff, diffTop, caretTop);
    });

    const diff = diffRef.current;
    resizeObserver.observe(diff);
    return () => resizeObserver.disconnect();
  }, [showAllLines]);

  // Scroll lines depending on position of the caret.
  useLayoutEffect(() => {
    if (showAllLines || diffRef.current === null || caretRef.current === null) {
      return;
    }

    const diff = diffRef.current!;
    const caret = caretRef.current!;

    const diffTop = diff.getBoundingClientRect().top;
    const caretTop = caret.getBoundingClientRect().top;

    syncScrollingWithCaret(diff, diffTop, caretTop);
  }, [showAllLines, attempt]);

  const diffWordSpans = diffWords.map(({ letters, skipped, focused }, i) => {
    return (
      <span key={i} className={`Word ${skipped ? "Skipped" : ""}`}>
        {focused && (
          <div
            ref={caretRef}
            className="Caret"
            style={{
              top: "0px",
              left: `${1 + letters.findLastIndex(({ state }) => state !== "Untyped")}ch`,
            }}
          ></div>
        )}
        {letters.map((diffLetterProps, i) => (
          <DiffLetter key={i} {...diffLetterProps} />
        ))}
      </span>
    );
  });

  if (showAllLines) {
    return <div className="Diff">{diffWordSpans}</div>;
  } else {
    return (
      <div
        className="Diff"
        style={{ height: "3lh", overflow: "hidden" }}
        ref={diffRef}
        {...disableCutCopyPasteProps()}
      >
        {diffWordSpans}
        <div className="EmptyLine" />
        <div className="EmptyLine" />
        <div className="EmptyLine" />
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

const DiffLetter = ({ letter, state }: DiffLetterProps) => {
  return <span className={`Letter ${state}`}>{letter}</span>;
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

function syncScrollingWithCaret(
  diff: HTMLDivElement,
  diffTop: number,
  caretTop: number,
) {
  const lineHeight = parseFloat(window.getComputedStyle(diff).lineHeight);
  let scroll = Math.floor((caretTop - diffTop) / lineHeight);
  console.log(scroll);

  if (scroll < 1) {
    while (scroll < 0) {
      diff.scrollTop -= lineHeight;
      scroll += 1;
    }
    if (scroll === 0 && diff.scrollTop !== 0) {
      diff.scrollTop -= lineHeight;
    }
  }

  if (scroll > 1) {
    while (scroll > 2) {
      diff.scrollTop += lineHeight;
      scroll -= 1;
    }
    if (scroll === 2) {
      diff.scrollTop += lineHeight;
    }
  }
}

export default Diff;
