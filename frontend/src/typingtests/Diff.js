import { usePreference } from "../preferences";
import "./Diff.css";

const Diff = ({ test, attempt, isTestBounded }) => {
  const [maxCharsInLine] = usePreference("maxCharsInLine");
  const [showAllLines] = usePreference("showAllLines");

  const diffWords = getDiffWords(test, attempt);

  const diffLines = getDiffLines(diffWords, maxCharsInLine);

  if (isTestBounded && showAllLines) {
    return (
      <div className="Diff">
        {diffLines.map((words, i) => (
          <div key={i} className="Line">
            {words.map((letters, i) => (
              <Word key={i} letters={letters} />
            ))}
          </div>
        ))}
      </div>
    );
  } else {
    const focusedLineNumber = getFocusedLineNumber(
      diffLines,
      /* focusedWordNumber = */ attempt.length - 1,
    );
    const firstLineNumber = Math.max(0, focusedLineNumber - 1);
    const displayLines = diffLines.slice(firstLineNumber, firstLineNumber + 3);

    const emptyLine = Array(maxCharsInLine).fill([{ letter: " " }]);
    while (displayLines.length < 3) {
      displayLines.push(emptyLine);
    }

    return (
      <div className="Diff">
        {displayLines.map((words, i) => (
          <div key={i} className="Line">
            {words.map((letters, i) => (
              <Word key={i} letters={letters} />
            ))}
          </div>
        ))}
      </div>
    );
  }
};

const Word = ({ letters }) => {
  return (
    <span className="Word">
      {letters.map((props, i) => (
        <Letter key={i} {...props} />
      ))}
    </span>
  );
};

const Letter = ({ letter, state = "Normal" }) => {
  return <span className={`Letter ${state}`}>{letter}</span>;
};

const getDiffWords = (test, attempt) => {
  const diffWords = [];

  for (let i = 0; i + (attempt.length > test.length) < attempt.length; i++) {
    const word = test[i];
    const attemptedWord = attempt[i];

    const minLength = Math.min(word.length, attemptedWord.length);
    const maxLength = Math.max(word.length, attemptedWord.length);

    const letters = [];

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

    diffWords.push(letters);
  }

  for (let i = attempt.length; i < test.length; i++) {
    const word = test[i];
    const letters = [];
    for (const letter of word) {
      letters.push({ letter });
    }
    diffWords.push(letters);
  }

  return diffWords;
};

const getDiffLines = (diffWords, maxCharsInLine) => {
  const lines = [];

  let currentLine = [];
  let currentLineChars = 0;

  for (let i = 0; i < diffWords.length; i++) {
    const word = diffWords[i];
    const len = word.length;
    if (currentLineChars + len + 1 <= maxCharsInLine) {
      currentLine.push(word);
      currentLine.push([{ letter: " " }]);
      currentLineChars += len + 1;
    } else if (currentLineChars + len <= maxCharsInLine) {
      currentLine.push(word);
      currentLineChars += len;
    } else {
      lines.push(currentLine);
      currentLine = [word, [{ letter: " " }]];
      currentLineChars = len + 1;
    }
  }

  lines.push(currentLine);

  return lines;
};

const getFocusedLineNumber = (diffLines, focusedWordNumber) => {
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

// TODO: Use this to render a caret.
const getCaretPosition = (diffLines, focusedWordNumber) => {
  let currentWordNumber = 0;
  for (const [lineNumber, line] of diffLines.entries()) {
    let currentLineChars = 0;
    for (const word of line) {
      if (word.length === 1 && word[0].letter === " ") {
        currentLineChars += 1;
        continue;
      }
      if (currentWordNumber === focusedWordNumber) {
        let row = lineNumber;
        let index = word.findLastIndex((letter) => letter.state !== "Normal");
        let column = currentLineChars + index + 1;
        return [row, column];
      }
      currentWordNumber += 1;
      currentLineChars += word.length;
    }
  }
  return [null, null];
};

export default Diff;
