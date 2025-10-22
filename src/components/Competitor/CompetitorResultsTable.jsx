import { Link as RouterLink } from "react-router-dom";
import { Link, Table, TableBody, TableCell, TableHead, TableRow, Paper, useMediaQuery } from "@mui/material";
import { yellow, green } from "@mui/material/colors";
import { times } from "../../lib/utils";
import { formatAttemptResult, formatCellValue } from "../../lib/attempt-result";
import { paddedAttemptResults } from "../../lib/result";
import { getRoundDisplayName } from "../../lib/competition";

const styles = {
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
  roundName: {
    width: { xs: 150, lg: 200 },
  },
};

function CompetitorResultsTable({ results, onResultClick }) {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));
  const numberOfAttempts = 3;

  return (
    <Paper>
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell align="right" sx={styles.ranking}>
              #
            </TableCell>
            <TableCell sx={styles.roundName}>Round</TableCell>
            {smScreen &&
              times(numberOfAttempts, (index) => (
                <TableCell key={index} align="right">
                  {index + 1}
                </TableCell>
              ))}

            <TableCell align="right">Average</TableCell>
            <TableCell align="right">Best</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result) => (
            <TableRow
              key={result.roundId}
              hover
              sx={{ whiteSpace: "nowrap", "&:last-child td": { border: 0 } }}
              onClick={(event) => onResultClick(result, event)}
            >
              <TableCell
                align="right"
                sx={{
                  ...styles.ranking,
                  ...(result.advancing ? styles.advancing : {}),
                  ...(result.advancingQuestionable ? styles.advancingQuestionable : {}),
                }}
              >
                {result.ranking}
              </TableCell>
              <TableCell sx={styles.roundName}>
                {smScreen ? (
                  <Link
                    component={RouterLink}
                    to={`/events/${result.eventId}/rounds/${result.roundId}`}
                    underline="hover"
                  >
                    {getRoundDisplayName(result.roundId)}
                  </Link>
                ) : (
                  getRoundDisplayName(result.roundId)
                )}
              </TableCell>
              {smScreen &&
                paddedAttemptResults(result, numberOfAttempts).map((attemptResult, index) => (
                  <TableCell key={index} align="right">
                    {formatCellValue(attemptResult)}
                  </TableCell>
                ))}

              <TableCell
                align="right"
                sx={{
                  fontWeight: 600,
                }}
              >
                {formatAttemptResult(result.average)}
              </TableCell>
              <TableCell align="right">{formatAttemptResult(result.best)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default CompetitorResultsTable;
