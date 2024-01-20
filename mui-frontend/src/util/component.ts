export const disableCutCopyPasteProps = () => {
  return {
    onCut: disableEvent,
    onCopy: disableEvent,
    onPaste: disableEvent,
  };
};

const disableEvent = (event: React.SyntheticEvent) => {
  event.preventDefault();
  return false;
};
