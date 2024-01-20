export function randomInt(first: number, last: number): number {
  return first + Math.floor(Math.random() * (last - first));
}

export function timestampInSecs(): number {
  return Math.floor(Date.now() / 1000);
}

export function fractionToPercentage(fraction: number): number {
  return roundToTwoDecimalPlaces(fraction * 100);
}

export function roundToTwoDecimalPlaces(number: number): number {
  return Math.round(number * 100) / 100;
}
