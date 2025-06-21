import { createService } from "..";

export const KeyboardService = createService<{
  bind: (bind: Bind) => void;
  unbind: (bind: Bind) => void;
  bindMode: (mode: Mode) => void;
  unbindMode: (mode: Mode) => void;
  hints: Hint[];
}>({
  bind: () => {},
  unbind: () => {},
  bindMode: () => {},
  unbindMode: () => {},
  hints: [],
});

export interface Mode {
  key: string;
  desc: string;
  binds: Bind[];
}

export interface Bind {
  key: string;
  desc: string;
  callback: () => {};
}

export type BindOrMode = Mode | Bind;

export interface Hint {
  key: string;
  desc: string;
}
