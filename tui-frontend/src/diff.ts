import "./style/Diff.scss";

function Diff({ test, attempt }: { test: string[]; attempt: string[] }) {
  const maxCharsInLine = 60;
  const showAllLines = false;
  const isTestBounded = true;

  const diffWords: WordProps[] = getDiffWords(test, attempt);
  const diffLines: LineProps[] = getDiffLines(diffWords, maxCharsInLine);

  if (isTestBounded && showAllLines) {
    return $("<div>")
      .addClass("Diff")
      .append(...diffLines.map(Line));
  } else {
    const focusedWordNumber = attempt.length - 1;
    const focusedLineNumber = getFocusedLineNumber(
      diffLines,
      focusedWordNumber,
    );
    const firstLineNumber = Math.max(0, focusedLineNumber - 1);
    const displayLines = diffLines.slice(firstLineNumber, firstLineNumber + 3);

    const emptyLine: LineProps = {
      words: Array<WordProps>(maxCharsInLine).fill({
        letters: [
          {
            letter: " ",
            state: "Normal",
          },
        ],
      }),
    };

    while (displayLines.length < 3) {
      displayLines.push(emptyLine);
    }

    return $("<div>")
      .addClass("Diff")
      .append(...displayLines.map(Line));
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

interface LineProps {
  words: WordProps[];
}

const Line = ({ words }: LineProps) => {
  return $("<div>")
    .addClass("Line")
    .append(...words.map(Word));
};

const Word = ({ letters }: WordProps) => {
  return $("<span>")
    .addClass("Word")
    .append(...letters.map(Letter));
};

const Letter = ({ letter, state }: LetterProps) => {
  return $("<span>").addClass(`Letter ${state}`).append(letter);
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
): LineProps[] => {
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
      lines.push({ words: currentLine });
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

  lines.push({ words: currentLine });

  return lines;
};

const getFocusedLineNumber = (
  diffLines: LineProps[],
  focusedWordNumber: number,
): number => {
  let currentWordNumber = 0;
  for (let lineNumber = 0; lineNumber < diffLines.length; lineNumber++) {
    const { words } = diffLines[lineNumber];
    for (const word of words) {
      const { letters } = word;
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

export default Diff;
