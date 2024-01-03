/**
 * Returns a random integer between first and end (exclusive).
 * @param {number} first
 * @param {number} last
 */
export const randomInt = (first, last) => {
  return first + Math.floor(Math.random() * (last - first));
};

export const timestampInSecs = () => {
  return Math.floor(Date.now() / 1000);
};

export const fractionToPercentage = (fraction) => {
  return roundToTwoDecimalPlaces(fraction * 100);
};

export const roundToTwoDecimalPlaces = (number) => {
  return Math.round(number * 100) / 100;
};
