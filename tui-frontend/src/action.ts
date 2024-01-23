export type Action = () => void;

const actionsMap: { [key: string]: Action } = {};

export function registerAction(command: string, action: Action) {
  actionsMap[command] = action;
}
