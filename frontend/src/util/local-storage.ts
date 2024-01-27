export function getItem(itemName: string): object {
  return JSON.parse(window.localStorage.getItem(itemName)!);
}

export function getOrInitItem(itemName: string, init: object): object {
  const item = getItem(itemName);
  if (item === null) {
    setItem(itemName, init);
    return init;
  }
  return item;
}

export function setItem(itemName: string, item: object) {
  window.localStorage.setItem(itemName, JSON.stringify(item));
}
