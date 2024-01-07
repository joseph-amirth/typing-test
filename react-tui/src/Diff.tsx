import "./style/Diff.scss";
import { disableCutCopyPasteProps } from "./util/antiCheat";

function Diff({ test, attempt }: { test: string[]; attempt: string[] }) {
  const maxCharsInLine = 60;
  const showAllLines = true;
  const isTestBounded = true;

  const diffWords: WordProps[] = getDiffWords(test, attempt);
  const diffLines: WordProps[][] = getDiffLines(diffWords, maxCharsInLine);

  if (isTestBounded && showAllLines) {
    return (
      <div className="Diff">
        {diffLines.map((words, i) => (
          <div key={i} className="Line">
            {words.map((props, i) => (
              <Word key={i} {...props} />
            ))}
          </div>
        ))}
      </div>
    );
  } else {
    const focusedLineNumber = getFocusedLineNumber(
      diffLines,
      /* focusedWordNumber= */ attempt.length - 1,
    );
    const firstLineNumber = Math.max(0, focusedLineNumber - 1);
    const displayLines = diffLines.slice(firstLineNumber, firstLineNumber + 3);

    const emptyLine = Array(maxCharsInLine).fill([{ letter: " " }]);
    while (displayLines.length < 3) {
      displayLines.push(emptyLine);
    }

    return (
      <div className="Diff" {...disableCutCopyPasteProps()}>
        {displayLines.map((words, i) => (
          <div key={i} className="Line">
            {words.map((props, i) => (
              <Word key={i} {...props} />
            ))}
          </div>
        ))}
      </div>
    );
  }
}

type LetterState = "Normal" | "Correct" | "Wrong" | "Extra" | "Skipped";

interface LetterProps {
  letter: string;
  state: LetterState;
}

interface WordProps {
  letters: LetterProps[];
}

const Word = ({ letters }: WordProps) => {
  return (
    <span className="Word">
      {letters.map((props, i) => (
        <Letter key={i} {...props} />
      ))}
    </span>
  );
};

const Letter = ({ letter, state }: LetterProps) => {
  return <span className={`Letter ${state}`}>{letter}</span>;
};

function getDiffWords(test: string[], attempt: string[]): WordProps[] {
  const diffWords: WordProps[] = [];

  for (
    let i = 0;
    i + Number(attempt.length > test.length) < attempt.length;
    i++
  ) {
    const word = test[i];
    const attemptedWord = attempt[i];

    const minLength = Math.min(word.length, attemptedWord.length);
    const maxLength = Math.max(word.length, attemptedWord.length);

    const letters: LetterProps[] = [];

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
          state: i + 1 !== attempt.length ? "Skipped" : "Normal",
        });
      }
    }

    diffWords.push({ letters });
  }

  for (let i = attempt.length; i < test.length; i++) {
    const word = test[i];
    const letters: LetterProps[] = [];
    for (const letter of word) {
      letters.push({ letter, state: "Normal" });
    }
    diffWords.push({ letters });
  }

  return diffWords;
}

const getDiffLines = (
  diffWords: WordProps[],
  maxCharsInLine: number,
): WordProps[][] => {
  const lines = [];

  let currentLine: WordProps[] = [];
  let currentLineChars = 0;

  for (let i = 0; i < diffWords.length; i++) {
    const word = diffWords[i];
    const len = word.letters.length;
    if (currentLineChars + len + 1 <= maxCharsInLine) {
      currentLine.push(word);
      currentLine.push({
        letters: [
          {
            letter: " ",
            state: "Normal",
          },
        ],
      });
      currentLineChars += len + 1;
    } else if (currentLineChars + len <= maxCharsInLine) {
      currentLine.push(word);
      currentLineChars += len;
    } else {
      lines.push(currentLine);
      currentLine = [
        word,
        {
          letters: [
            {
              letter: " ",
              state: "Normal",
            },
          ],
        },
      ];
      currentLineChars = len + 1;
    }
  }

  lines.push(currentLine);

  return lines;
};

const getFocusedLineNumber = (diffLines: any, focusedWordNumber: number) => {
  let currentWordNumber = 0;
  for (const [lineNumber, line] of diffLines.entries()) {
    for (const word of line) {
      if (word.length === 1 && word[0].letter === " ") {
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

export default Diff;
