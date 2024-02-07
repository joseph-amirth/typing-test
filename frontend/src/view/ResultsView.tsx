import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Stack } from "@mui/system";
import { TypingTestParams } from "../context/preference";
import { useContext, useEffect, useState } from "react";
import { Result, ResultsService } from "../service/results";

const ResultsView = () => {
  const { getResults } = useContext(ResultsService);

  const [results, setResults] = useState<Result[] | undefined>(undefined);

  useEffect(() => {
    getResults().then((response) => {
      if (response.status === "ok") {
        const results = response.body;
        setResults(results);
      }
    });
  }, []);

  if (results === undefined) {
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
              (
                { testParams, testCompletedTimestamp, wpm, rawWpm, accuracy },
                i,
              ) => {
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <TypingTestParamsDisplay {...testParams} />
                    </TableCell>
                    <TableCell>{wpm}</TableCell>
                    <TableCell>{accuracy}</TableCell>
                    <TableCell>{rawWpm}</TableCell>
                    <TableCell>
                      {getDateFromTimestampInSecs(testCompletedTimestamp)}
                    </TableCell>
                  </TableRow>
                );
              },
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

const TypingTestParamsDisplay = ({ mode, params }: TypingTestParams) => {
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
};

const getDateFromTimestampInSecs = (timestampInSecs: number) => {
  const datetime = new Date(timestampInSecs * 1000);
  return datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString();
};

export default ResultsView;
