export const disableCutCopyPasteProps = () => {
  return {
    onCut: disableEvent,
    onCopy: disableEvent,
    onPaste: disableEvent,
  };
};

const disableEvent = (event: any) => {
  event.preventDefault();
  return false;
};
