import {
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { TypingTestParams } from "../context/preference";
import View from "./View";

const PAGE_SIZE = 15;

const ResultsView = () => {
  const params = useLoaderData() as
    | { error: string }
    | Array<{
        testParams: TypingTestParams;
        testCompletedTimestamp: number;
        wpm: number;
        rawWpm: number;
        accuracy: number;
      }>;
  const [page, setPage] = useState(1);

  if ("error" in params) {
    return <div>{params.error}</div>;
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number,
  ) => {
    setPage(page);
  };

  return (
    <View>
      <Stack
        alignItems="center"
        spacing="1em"
        sx={{ margin: "0 auto", width: "50%" }}
      >
        <Pagination
          count={Math.ceil(params.length / PAGE_SIZE)}
          onChange={handlePageChange}
          color="primary"
        />
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
              {params
                .filter(
                  (_, i) => (page - 1) * PAGE_SIZE <= i && i < page * PAGE_SIZE,
                )
                .map(
                  (
                    {
                      testParams,
                      testCompletedTimestamp,
                      wpm,
                      rawWpm,
                      accuracy,
                    },
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
    </View>
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
