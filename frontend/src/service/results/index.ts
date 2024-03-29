import { createService } from "..";
import { TypingTestParams } from "../../service/preferences";
import { ServerResponse } from "../server";

export const ResultsService = createService<{
  getResults: (
    params: GetResultsParams,
    options?: RequestInit,
  ) => Promise<ServerResponse<GetResultsResponse>>;
  reportResult: (result: Result) => void;
  getStats: (
    params: GetStatsParams,
    options?: RequestInit,
  ) => Promise<ServerResponse<GetStatsResponse>>;
}>({
  getResults: async () => {
    return { status: "fail" };
  },
  reportResult: () => {},
  getStats: async () => {
    return { status: "fail" };
  },
});

export interface GetResultsParams {
  cursor?: number;
  limit: number;
}

export interface GetResultsResponse {
  cursor: number;
  results: Result[];
}

export interface PostResultResponse {
  resultId: number;
}

export interface GetStatsParams {}

export interface GetStatsResponse {
  stats: Stat[];
}

export interface Result {
  testParams: TypingTestParams;
  testCompletedTimestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
}

export interface Stat {
  testParams: TypingTestParams;
  bestWpm: number;
  bestRawWpm: number;
  bestAccuracy: number;
  avgWpm: number;
  avgRawWpm: number;
  avgAccuracy: number;
}
