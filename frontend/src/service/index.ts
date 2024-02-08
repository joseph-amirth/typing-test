import React, { createContext, useContext } from "react";

export function createService<T>(defaultValue: T): React.Context<T> {
  return createContext(defaultValue);
}

export function useService<T>(context: React.Context<T>): T {
  return useContext(context);
}
