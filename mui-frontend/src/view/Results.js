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

const PAGE_SIZE = 15;

const Results = () => {
  const params = useLoaderData();
  const [page, setPage] = useState(1);

  const { error } = params;
  if (error !== undefined) {
    return <div>{error}</div>;
  }

  const handlePageChange = (_event, value) => {
    setPage(value);
  };

  return (
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
                  { testParams, testCompletedTimestamp, wpm, rawWpm, accuracy },
                  i,
                ) => {
                  return (
                    <TableRow key={i}>
                      <TableCell>
                        <TypingTestParams {...testParams} />
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

const TypingTestParams = ({ mode, params }) => {
  const stat = (() => {
    if (mode === "words" || mode === "quote") {
      return params.length;
    } else {
      return params.duration;
    }
  })();

  const language = params.language;

  return (
    <div className="TypingTestParams">
      {stat} {mode} {language}
    </div>
  );
};

const getDateFromTimestampInSecs = (timestampInSecs) => {
  const datetime = new Date(timestampInSecs * 1000);
  return datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString();
};

export default Results;