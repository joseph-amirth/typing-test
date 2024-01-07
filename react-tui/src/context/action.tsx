import { createContext } from "react";

export type ActionKind = "insert" | "control";

export type Callback<T> = (t: T) => void;

export type CallbackArray<Actions extends { kind: string }> = {
  [A in Actions as `${A["kind"]}Callbacks`]: Array<Callback<A>>;
};

export type RegisterCallback<Actions extends { kind: string }> = {
  [A in Actions as `register${Capitalize<A["kind"]>}Callback`]: (
    callback: Callback<A>,
  ) => void;
};

export interface InsertAction {
  kind: "insert";
  letter: string;
}

export interface ControlAction {
  kind: "control";
  control: "Insert" | "Restart" | "Next";
}

export type Action = InsertAction | ControlAction;

export const ActionContext = createContext<RegisterCallback<Action>>({
  registerInsertCallback: (callback) => {
    callbacks.insertCallbacks.push(callback);
  },
  registerControlCallback: (callback) => {
    callbacks.controlCallbacks.push(callback);
  },
});

const callbacks: CallbackArray<Action> = {
  insertCallbacks: [],
  controlCallbacks: [],
};

export const useActionCallbacks = () => {
  return { callbacks };
};
