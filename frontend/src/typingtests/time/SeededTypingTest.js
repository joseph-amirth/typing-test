import languages from "../../languages";
import * as prng from "../../utils/prng";
import "./SeededTypingTest.css";
import TimedTypingTest from "../TimedTypingTest";

const SeededTypingTest = ({ language, duration, seed }) => {
  const words = languages[language];

  const generateTest = (count) => {
    const rand = prng.mulberry32(seed);
    const randomWord = () => words[rand() % words.length];

    const test = [];
    for (let i = 0; i < count; i++) {
      test.push(randomWord());
    }

    return test;
  };

  return <TimedTypingTest generateTest={generateTest} duration={duration} />;
};

export default SeededTypingTest;
