import languages from "../../languages";
import * as prng from "../../utils/prng";
import BoundedTypingTest from "../BoundedTypingTest";
import "./SeededTypingTest.css";

const range = (n) => {
  return [...Array(n).keys()];
};

const randomWord = (rand, language) => {
  return language[rand() % language.length];
};

const randomWords = (rand, language, count) => {
  const words = languages[language];
  return range(count).map(() => randomWord(rand, words));
};

const SeededTypingTest = ({ language, length, seed }) => {
  const rand = prng.mulberry32(seed);

  const test = randomWords(rand, language, length);

  return (
    <div className="SeededTypingTest">
      <BoundedTypingTest test={test} />
    </div>
  );
};

export default SeededTypingTest;
