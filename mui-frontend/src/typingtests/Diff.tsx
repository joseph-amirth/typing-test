import { disableCutCopyPasteProps } from "../util/component";
import "./Diff.css";

const Diff = ({
  test,
  attempt,
  maxCharsInLine,
  showAllLines,
}: {
  test: string[];
  attempt: string[];
  maxCharsInLine: number;
  showAllLines: boolean;
}) => {
  const diffWords = getDiffWords(test, attempt);
  const diffLines = getDiffLines(diffWords, maxCharsInLine);

  const focusedWordNumber = attempt.length - 1;
  const [row, column] = getCaretPosition(diffLines, focusedWordNumber);

  if (showAllLines) {
    return (
      <div className="Diff">
        <Caret row={row} column={column} />
        {diffLines.map(({ words }, i) => (
          <Line key={i} words={words} />
        ))}
      </div>
    );
  } else {
    const focusedLineNumber = getFocusedLineNumber(
      diffLines,
      focusedWordNumber,
    );
    const firstLineNumber = Math.max(0, focusedLineNumber - 1);
    const displayLines = diffLines.slice(firstLineNumber, firstLineNumber + 3);

    const emptyLine: DiffLineProps = {
      words: Array<DiffWordProps>(maxCharsInLine).fill({
        letters: [
          {
            letter: " ",
            state: "Untyped",
          },
        ],
        skipped: false,
      }),
    };

    while (displayLines.length < 3) {
      displayLines.push(emptyLine);
    }

    return (
      <div className="Diff" {...disableCutCopyPasteProps()}>
        <Caret
          row={row === undefined ? row : Math.min(row, 1)}
          column={column}
        />
        {displayLines.map(({ words }, i) => (
          <Line key={i} words={words} />
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
}

interface DiffLineProps {
  words: DiffWordProps[];
}

const Caret = ({ row, column }: { row?: number; column?: number }) => {
  if (row === undefined || column === undefined) {
    return null;
  }
  return (
    <div
      className="Caret"
      style={{
        top: `calc(${row}lh + 2px)`,
        left: `${column}ch`,
      }}
    ></div>
  );
};

const DiffLetter = ({ letter, state }: DiffLetterProps) => {
  return <span className={`Letter ${state}`}>{letter}</span>;
};

const DiffWord = ({ letters, skipped }: DiffWordProps) => {
  return (
    <span className={`Word ${skipped ? "Skipped" : ""}`}>
      {letters.map((diffLetterProps, i) => (
        <DiffLetter key={i} {...diffLetterProps} />
      ))}
    </span>
  );
};

const Line = ({ words }: DiffLineProps) => {
  return (
    <div className="Line">
      {words.map((diffWordProps, i) => (
        <DiffWord key={i} {...diffWordProps} />
      ))}
    </div>
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

    const skipped =
      i + 1 !== attempt.length &&
      letters.some(({ state }) => state !== "Correct");
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

function getDiffLines(
  diffWords: DiffWordProps[],
  maxCharsInLine: number,
): DiffLineProps[] {
  const lines: DiffLineProps[] = [];

  let currentLine: DiffWordProps[] = [];
  let currentLineChars = 0;

  const space: DiffWordProps = {
    letters: [{ letter: " ", state: "Untyped" }],
    skipped: false,
  };

  for (let i = 0; i < diffWords.length; i++) {
    const len = diffWords[i].letters.length;
    if (currentLineChars + len + 1 <= maxCharsInLine) {
      currentLine.push(diffWords[i]);
      currentLine.push(space);
      currentLineChars += len + 1;
    } else if (currentLineChars + len <= maxCharsInLine) {
      currentLine.push(diffWords[i]);
      currentLineChars += len;
    } else {
      // Fill remainder of the line with spaces.
      while (currentLineChars < maxCharsInLine) {
        currentLine.push(space);
        currentLineChars += 1;
      }
      lines.push({ words: currentLine });
      // Reset current line.
      currentLine = [diffWords[i], space];
      currentLineChars = len + 1;
    }
  }

  lines.push({ words: currentLine });

  return lines;
}

const getFocusedLineNumber = (
  diffLines: DiffLineProps[],
  focusedWordNumber: number,
): number => {
  let currentWordNumber = 0;
  for (let lineNumber = 0; lineNumber < diffLines.length; lineNumber++) {
    const { words } = diffLines[lineNumber];
    for (const { letters } of words) {
      if (letters.length === 1 && letters[0].letter === " ") {
        continue;
      }
      if (currentWordNumber === focusedWordNumber) {
        return lineNumber;
      }
      currentWordNumber += 1;
    }
  }
  return diffLines.length - 1;
};

function getCaretPosition(
  diffLines: DiffLineProps[],
  focusedWordNumber: number,
): [number?, number?] {
  let currentWordNumber = 0;
  for (let lineNumber = 0; lineNumber < diffLines.length; lineNumber++) {
    let { words } = diffLines[lineNumber];
    let currentLineChars = 0;
    for (const { letters } of words) {
      if (letters.length === 1 && letters[0].letter === " ") {
        currentLineChars += 1;
        continue;
      }
      if (currentWordNumber === focusedWordNumber) {
        let row = lineNumber;
        let index = letters.findLastIndex(
          (letter: DiffLetterProps) => letter.state !== "Untyped",
        );
        let column = currentLineChars + index + 1;
        return [row, column];
      }
      currentWordNumber += 1;
      currentLineChars += letters.length;
    }
  }
  return [undefined, undefined];
}

export default Diff;
