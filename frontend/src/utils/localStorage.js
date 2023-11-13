export const getItem = (itemName) => {
  return JSON.parse(window.localStorage.getItem(itemName));
};

export const getOrInitItem = (itemName, init) => {
  const item = getItem(itemName);
  if (item === null) {
    setItem(init);
    return init;
  }
  return item;
};

export const setItem = (itemName, item) => {
  window.localStorage.setItem(itemName, JSON.stringify(item));
};
