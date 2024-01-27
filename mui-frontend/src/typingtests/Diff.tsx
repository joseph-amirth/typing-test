import { useLayoutEffect, useRef } from "react";
import { ANTI_CHEAT_PROPS } from "../util/component";
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

  // Scroll diff and set position of the caret.
  useLayoutEffect(() => {
    if (showAllLines || diffRef.current === null || caretRef.current === null) {
      return;
    }

    const fixScrollAndCaretPosition = () => {
      const diff = diffRef.current!;
      const caret = caretRef.current!;

      const focusedWord = diff.querySelector(
        `:nth-child(${Math.min(test.length, attempt.length)} of .Word)`,
      )!;

      // Set caret's new horizontal position.
      const firstUntypedLetter = focusedWord.querySelector(".Untyped");
      const diffLeft = diff.getBoundingClientRect().left;
      if (firstUntypedLetter !== null) {
        caret.style.left = `${
          firstUntypedLetter.getBoundingClientRect().left - diffLeft
        }px`;
      } else {
        caret.style.left = `${
          focusedWord.getBoundingClientRect().right - diffLeft
        }px`;
      }

      // Scroll diff.
      const diffTop = diff.getBoundingClientRect().top;
      const focusedWordTop = focusedWord.getBoundingClientRect().top;
      const oldDiffScroll = diff.scrollTop;
      scrollDiff(diff, diffTop, focusedWordTop);

      // Set caret's new vertical position.
      const newDiffScroll = diff.scrollTop;
      const deltaScroll = newDiffScroll - oldDiffScroll;
      const newFocusedWordTop = focusedWordTop - deltaScroll;
      caret.style.top = `${newFocusedWordTop - diffTop + newDiffScroll}px`;
    };

    fixScrollAndCaretPosition();

    const resizeObserver = new ResizeObserver(fixScrollAndCaretPosition);

    const diff = diffRef.current!;
    resizeObserver.observe(diff);
    return () => resizeObserver.disconnect();
  }, [showAllLines, test, attempt]);

  const diffWordSpans = diffWords.flatMap(({ letters, skipped }, i) => {
    return [
      <span key={i} className={`Word ${skipped ? "Skipped" : ""}`}>
        {letters.map((diffLetterProps, j) => (
          <DiffLetter key={j} {...diffLetterProps} />
        ))}
      </span>,
      " ",
    ];
  });

  if (showAllLines) {
    return <div className="Diff">{diffWordSpans}</div>;
  } else {
    return (
      <div
        className="Diff"
        style={{ height: "3lh", overflow: "hidden" }}
        ref={diffRef}
        {...ANTI_CHEAT_PROPS}
      >
        <div ref={caretRef} className="Caret"></div>
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
    diffWords.push({ letters, skipped });
  }

  for (let i = attempt.length; i < test.length; i++) {
    const word = test[i];
    const letters: DiffLetterProps[] = [];
    for (const letter of word) {
      letters.push({ letter, state: "Untyped" });
    }
    diffWords.push({ letters, skipped: false });
  }

  return diffWords;
}

function scrollDiff(
  diff: HTMLDivElement,
  diffTop: number,
  focusedWordTop: number,
) {
  const lineHeight = parseFloat(window.getComputedStyle(diff).lineHeight);
  let scroll = Math.floor((focusedWordTop - diffTop) / lineHeight);

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
