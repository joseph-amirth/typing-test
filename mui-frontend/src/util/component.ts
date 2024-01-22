const disableEvent = (event: React.SyntheticEvent) => {
  event.preventDefault();
  return false;
};

export const ANTI_CHEAT_PROPS = {
  onCut: disableEvent,
  onCopy: disableEvent,
  onPaste: disableEvent,
};
