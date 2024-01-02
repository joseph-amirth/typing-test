export const disableCutCopyPasteProps = () => {
  return {
    onCut: disableEvent,
    onCopy: disableEvent,
    onPaste: disableEvent,
  };
};

const disableEvent = (event) => {
  event.preventDefault();
  return false;
};
