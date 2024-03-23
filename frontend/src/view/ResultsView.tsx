import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Stack } from "@mui/system";
import { TypingTestParams } from "../service/preferences";
import { useEffect, useState } from "react";
import { Result, ResultsService } from "../service/results";
import { useService } from "../service";

const LIMIT = 10;

type FetchState =
  | { state: "none" }
  | { state: "some"; cursor: number }
  | { state: "all" };

function ResultsView() {
  const resultsService = useService(ResultsService);

  const [fetchState, setFetchState] = useState<FetchState>({
    state: "none",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  const getResults = () => {
    if (loading) {
      return;
    }
    const cursor = fetchState.state === "some" ? fetchState.cursor : undefined;
    setLoading(true);
    resultsService.getResults({ cursor, limit: LIMIT }).then((response) => {
      if (response.status === "ok") {
        const { cursor, results } = response.body;
        if (cursor === 0) {
          setFetchState({ state: "all" });
        } else {
          setFetchState({ state: "some", cursor });
        }
        setResults((oldResults) => {
          const sortedResults = sortByTimestamp([...oldResults, ...results]);
          const uniqueResults = dedupByTimestamp(sortedResults);
          return uniqueResults;
        });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    getResults();
  }, []);

  if (fetchState.state === "none") {
    return "Loading results...";
  }

  return (
    <Stack
      alignItems="center"
      spacing="1em"
      sx={{ margin: "0 auto", width: "100%" }}
    >
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mode</TableCell>
              <TableCell>WPM</TableCell>
              <TableCell>Accuracy</TableCell>
              <TableCell>Raw WPM</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map(
              ({
                testParams,
                testCompletedTimestamp,
                wpm,
                rawWpm,
                accuracy,
              }) => {
                return (
                  <TableRow key={testCompletedTimestamp}>
                    <TableCell>
                      <TypingTestParamsDisplay {...testParams} />
                    </TableCell>
                    <TableCell>{wpm}</TableCell>
                    <TableCell>{accuracy}</TableCell>
                    <TableCell>{rawWpm}</TableCell>
                    <TableCell>
                      <TimestampDisplay timestamp={testCompletedTimestamp} />
                    </TableCell>
                  </TableRow>
                );
              },
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {fetchState.state === "some" &&
        (!loading ? (
          <Button variant="contained" onClick={getResults}>
            Load more
          </Button>
        ) : (
          "Loading results..."
        ))}
      {fetchState.state === "all" && "All results loaded"}
    </Stack>
  );
}

function TypingTestParamsDisplay({ mode, params }: TypingTestParams) {
  const stat = (() => {
    if (mode === "words" || mode === "quote") {
      return params.length;
    } else {
      return params.duration;
    }
  })();

  return (
    <div className="TypingTestParams">
      {stat} {mode} {"language" in params ? params.language : undefined}
    </div>
  );
}

function TimestampDisplay({ timestamp }: { timestamp: number }) {
  const datetime = new Date(timestamp);
  return datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString();
}

function sortByTimestamp(results: Result[]): Result[] {
  const sortedResults = [...results];
  sortedResults.sort(
    (a, b) => b.testCompletedTimestamp - a.testCompletedTimestamp,
  );
  return sortedResults;
}

function dedupByTimestamp(results: Result[]): Result[] {
  const uniqueResults = [results[0]];
  for (let i = 1; i < results.length; i++) {
    if (
      results[i].testCompletedTimestamp !==
      results[i - 1].testCompletedTimestamp
    ) {
      uniqueResults.push(results[i]);
    }
  }
  return uniqueResults;
}

export default ResultsView;
