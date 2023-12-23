export const timestampInSecs = () => {
  return Math.floor(Date.now() / 1000);
};

export const fractionToPercentage = (fraction) => {
  return roundToTwoDecimalPlaces(fraction * 100);
};

export const roundToTwoDecimalPlaces = (number) => {
  return Math.round(number * 100) / 100;
};
