import { memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, useMediaQuery } from "@mui/material";
import { yellow, green } from "@mui/material/colors";
import { times } from "../../lib/utils";
import { formatAttemptResult } from "../../lib/attempt-result";
import { orderedResultStats, paddedAttemptResults } from "../../lib/result";
import ResultStat from "../ResultStat/ResultStat";

const UNRANKED_POSITION = 1000000;

const styles = {
  cell: {
    pr: { xs: "6px", md: "16px" },
    pl: { xs: "10px", md: "16px" },
    "&:last-child": {
      pr: 2,
    },
  },
  ranking: {
    pr: { xs: 1, md: 2 },
    width: { xs: 40, md: 50 },
  },
  advancing: {
    color: (theme) => theme.palette.getContrastText(green["A400"]),
    backgroundColor: green["A400"],
  },
  advancingQuestionable: {
    color: (theme) => theme.palette.getContrastText(yellow["200"]),
    backgroundColor: yellow["200"],
  },
  name: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    pr: 0,
    maxWidth: { xs: 150, md: 250 },
  },
};

const RoundResultsTable = memo(({ results, format, eventId, onResultClick, forecastView, isDivisionBased = false }) => {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const stats = orderedResultStats(
    eventId,
    format
    // Only show forecast view stat columns on wider screens
  );

  return (
    <Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...styles.cell, ...styles.ranking }} align="right">
              #
            </TableCell>
            <TableCell sx={styles.cell}>Name</TableCell>
            <TableCell sx={styles.cell}>Division</TableCell>
            {isDivisionBased && <TableCell sx={styles.cell}>Category</TableCell>}
            {smScreen &&
              times(format.numberOfAttempts, (index) => (
                <TableCell key={index} sx={styles.cell} align="right">
                  {index + 1}
                </TableCell>
              ))}
            {stats.map(({ name }) => (
              <TableCell key={name} sx={styles.cell} align="right">
                {name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result, index) => (
            <TableRow
              key={result.id}
              hover
              sx={{
                whiteSpace: "nowrap",
                "&:last-child td": { border: 0 },
              }}
              onClick={() => onResultClick && onResultClick(result)}
            >
              <TableCell
                align="right"
                sx={{
                  ...styles.cell,
                  ...styles.ranking,
                  ...(result.advancing ? styles.advancing : {}),
                  ...(result.advancingQuestionable ? styles.advancingQuestionable : {}),
                }}
              >
                {result.ranking === UNRANKED_POSITION ? "" : (typeof result.ranking === "number" ? result.ranking : index + 1)}
              </TableCell>
              <TableCell sx={{ ...styles.cell, ...styles.name }}>{result.name}</TableCell>
              <TableCell sx={{ ...styles.cell }}>{result.calculatedDivision}</TableCell>
              {isDivisionBased && <TableCell sx={{ ...styles.cell }}>{result.category}</TableCell>}
              {smScreen &&
                paddedAttemptResults(result, format.numberOfAttempts).map((attemptResult, index) => (
                  <TableCell key={index} align="right" sx={styles.cell}>
                    {formatAttemptResult(attemptResult, eventId)}
                  </TableCell>
                ))}
              {stats.map(({ name, field }, index) => (
                <TableCell
                  key={name}
                  align="right"
                  sx={{
                    ...styles.cell,
                    fontWeight: index === 0 ? 600 : 400,
                  }}
                >
                  <ResultStat result={result} field={field} eventId={eventId} forecastView={forecastView} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
});

RoundResultsTable.displayName = "RoundResultsTable";

export default RoundResultsTable;
