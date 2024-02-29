import { createService } from "..";
import { TypingTestParams } from "../../service/preferences";
import { ServerResponse } from "../server";

export const ResultsService = createService<{
  getResults: (
    params: GetResultsParams,
    options?: RequestInit,
  ) => Promise<ServerResponse<GetResultsResponse>>;
  reportResult: (result: Result) => void;
}>({
  getResults: async () => {
    return { status: "fail" };
  },
  reportResult: () => {},
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

export interface Result {
  testParams: TypingTestParams;
  testCompletedTimestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
}
