import { forwardRef, useImperativeHandle, useRef } from "react";
import { ANTI_CHEAT_PROPS } from "../util/component";
import "./Input.css";
import { usePreference } from "../service/preferences/hooks";

export interface InputOptions {
  allowSkippingWords?: boolean;
  allowBackspacingWords?: boolean;
  autoFocus?: boolean;
}

export interface InputHandle {
  focus: () => void;
  blur: () => void;
}

interface InputProps extends InputOptions {
  enabled: boolean;
  test: string[];
  attempt: string[];
  onAttemptUpdate: (newAttempt: string[]) => void;
}

function Input(
  {
    enabled,
    test,
    attempt,
    onAttemptUpdate,
    allowSkippingWords: allowSkippingWordsParam,
    allowBackspacingWords: allowBackspacingWordsParam,
    autoFocus: autoFocusParam,
  }: InputProps,
  ref: React.ForwardedRef<InputHandle>,
) {
  const [allowSkippingWordsPref] = usePreference("allowSkippingWords");
  const [allowBackspacingWordsPref] = usePreference("allowBackspacingWords");

  const allowSkippingWords =
    allowSkippingWordsParam !== undefined
      ? allowSkippingWordsParam
      : allowSkippingWordsPref;

  const allowBackspacingWords =
    allowBackspacingWordsParam !== undefined
      ? allowBackspacingWordsParam
      : allowBackspacingWordsPref;

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!enabled) {
      return;
    }

    const newAttempt = event.target.value.split(" ");

    // Don't allow user to type too many extra characters in a word.
    if (
      newAttempt.length <= test.length &&
      newAttempt[newAttempt.length - 1].length >
        test[newAttempt.length - 1].length + 20
    ) {
      return;
    }

    // Don't allow user to skip words.
    if (
      !allowSkippingWords &&
      newAttempt.length > attempt.length &&
      newAttempt[attempt.length - 1] !== test[attempt.length - 1]
    ) {
      return;
    }

    // Don't allow user to backspace words.
    if (!allowBackspacingWords && newAttempt.length < attempt.length) {
      return;
    }

    onAttemptUpdate(newAttempt);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);

  return (
    <input
      type="text"
      value={attempt.join(" ")}
      ref={inputRef}
      className="Input"
      onInput={handleInput}
      autoFocus={autoFocusParam !== undefined ? autoFocusParam : true}
      {...ANTI_CHEAT_PROPS}
    />
  );
}

const InputWithForwardedRef = forwardRef(Input);

export default InputWithForwardedRef;
