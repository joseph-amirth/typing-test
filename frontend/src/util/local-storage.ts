export function getItem<T>(itemName: string): T {
  return JSON.parse(window.localStorage.getItem(itemName)!);
}

export function getOrInitItem<T>(itemName: string, init: T): T {
  const item = getItem<T>(itemName);
  if (item === null) {
    setItem(itemName, init);
    return init;
  }
  return item;
}

export function setItem<T>(itemName: string, item: T) {
  window.localStorage.setItem(itemName, JSON.stringify(item));
}
