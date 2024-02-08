import React from "react";
import { TypingTestParams } from "../context/preference";
import { ServerResponse, ServerService } from "./server";
import { createService, useService } from ".";

export const ResultsService = createService<{
  getResults: () => Promise<ServerResponse<Result[]>>;
  postResult: (result: Result) => Promise<ServerResponse<undefined>>;
}>({
  getResults: async () => {
    return { status: "fail" };
  },
  postResult: async () => {
    return { status: "fail" };
  },
});

export function ResultsServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { get, post } = useService(ServerService);

  async function postResult(result: Result) {
    return post<undefined>("/result", result, { credentials: "include" });
  }

  async function getResults() {
    return get<Result[]>("/result", { credentials: "include" });
  }

  const resultsService = {
    getResults,
    postResult,
  };

  return (
    <ResultsService.Provider value={resultsService}>
      {children}
    </ResultsService.Provider>
  );
}

export interface Result {
  testParams: TypingTestParams;
  testCompletedTimestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
}
