import { forwardRef } from "react";
import { ANTI_CHEAT_PROPS } from "../util/component";
import "./Input.css";

export interface InputOptions {
  allowSkipping?: boolean;
  allowBackpedal?: boolean;
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
    allowSkipping,
    allowBackpedal,
  }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
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

    // Don't allow user to skip words if allowSkipping is true.
    if (
      allowSkipping !== undefined &&
      !allowSkipping &&
      newAttempt.length > attempt.length &&
      newAttempt[attempt.length - 1] !== test[attempt.length - 1]
    ) {
      return;
    }

    // Don't allow user to backspace words.
    if (
      allowBackpedal !== undefined &&
      !allowBackpedal &&
      newAttempt.length < attempt.length
    ) {
      return;
    }

    onAttemptUpdate(newAttempt);
  };

  return (
    <input
      type="text"
      value={attempt.join(" ")}
      ref={ref}
      className="Input"
      onInput={handleInput}
      autoFocus
      {...ANTI_CHEAT_PROPS}
    />
  );
}

const InputWithForwardedRef = forwardRef(Input);

export default InputWithForwardedRef;
