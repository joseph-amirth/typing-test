import { useEffect } from "react";
import {
  GetResultsParams,
  GetResultsResponse,
  PostResultResponse,
  Result,
  ResultsService,
} from ".";
import { useService } from "..";
import { AccountService } from "../account";
import { ServerService } from "../server";

let resultsQueue: Result[] = [];
let postingResults: boolean = false;

export function ResultsServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { get, post } = useService(ServerService);
  const { accountState } = useService(AccountService);

  // Clear the results queue when user logs out.
  useEffect(() => {
    if (accountState.state === "notsignedin") {
      resultsQueue = [];
    }
  }, [accountState]);

  async function tryPostResults() {
    while (resultsQueue.length > 0) {
      const result = resultsQueue[0];
      const response = await post<PostResultResponse>("/result", result, {
        credentials: "include",
      });
      if (response.status === "ok") {
        resultsQueue.shift();
      } else {
        break;
      }
    }
  }

  function reportResult(result: Result) {
    resultsQueue.push(result);
    if (!postingResults) {
      postingResults = true;
      tryPostResults().then(() => {
        postingResults = false;
      });
    }
  }

  async function getResults(params: GetResultsParams, options?: RequestInit) {
    const { cursor, limit } = params;
    let queryString = `limit=${limit}`;
    if (cursor !== undefined) {
      queryString += `&cursor=${cursor}`;
    }
    const response = await get<GetResultsResponse>("/result?" + queryString, {
      credentials: "include",
      ...options,
    });
    return response;
  }

  const resultsService = {
    getResults,
    reportResult,
  };

  return (
    <ResultsService.Provider value={resultsService}>
      {children}
    </ResultsService.Provider>
  );
}
