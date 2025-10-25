import { memo } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  Typography,
  Avatar,
  Box,
  Link,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { yellow, green, red } from "@mui/material/colors";
import { times } from "../../lib/utils";
import { formatCellValue } from "../../lib/attempt-result";
import { orderedResultStats, paddedAttemptResults } from "../../lib/result";
import ResultStat from "../ResultStat/ResultStat";
import { withImageWidth } from "../../lib/utils";
import FlagIcon from "../FlagIcon/FlagIcon";

const UNRANKED_POSITION = 1000000;

const styles = {
  cell: {
    pr: { xs: "6px", md: "16px" },
    pl: { xs: "10px", md: "16px" },
    "&:last-child": {
      pr: 2,
    },
  },
  image: {
    width: 32,
    p: 0.5,
    pr: { xs: 1, md: 2 },
    pl: { xs: 1, md: 2 },
  },
  ranking: {
    pr: { xs: 1, md: 2 },
    width: { xs: 40, md: 50 },
  },
  divRank: {
    pl: { xs: 1, md: 4 },
    width: { xs: 50, md: 100 },
    whiteSpace: "nowrap",
  },
  division: {
    width: { md: 140 },
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
    width: { xs: "100%", md: 350 },
    maxWidth: { xs: 150, md: 350 },
  },
  country: {
    width: { xs: 120, md: 200 },
    maxWidth: { xs: 120, md: 200 },
  },
  divisionChangeIcon: {
    fontSize: "1rem",
    ml: 0.5,
    verticalAlign: "middle",
  },
  promoted: {
    color: green[600],
  },
  demoted: {
    color: red[600],
  },
};

const renderDivisionChangeIcon = (divisionChange) => {
  if (!divisionChange?.status) return null;
  if (divisionChange.status === "promoted") {
    return (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: green[600],
          ml: 0.5,
        }}
        title={`Promoted from ${divisionChange.from} to ${divisionChange.to}`}
      >
        <ArrowUpward
          sx={{
            fontSize: "0.875rem",
            color: "white",
          }}
        />
      </Box>
    );
  }
  if (divisionChange.status === "demoted") {
    return (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: red[600],
          ml: 0.5,
        }}
        title={`Demoted from ${divisionChange.from} to ${divisionChange.to}`}
      >
        <ArrowDownward
          sx={{
            fontSize: "0.875rem",
            color: "white",
          }}
        />
      </Box>
    );
  }
  return null;
};

const RoundResultsTable = memo(({ results, format, eventId, onResultClick, forecastView, isDivisionBased = false }) => {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const stats = orderedResultStats(
    eventId,
    format
    // Only show forecast view stat columns on wider screens
  );

  // Calculate total number of columns for the empty state colspan
  const totalColumns =
    3 + // #, Image and Name columns
    (isDivisionBased ? 1 : 0) + // Div Rank column
    (smScreen ? 1 : 0) + // Country column
    (smScreen ? 1 : 0) + // Category column
    (smScreen && isDivisionBased ? 1 : 0) + // Division column
    (smScreen ? format.numberOfAttempts : 0) + // Attempt columns
    stats.length; // Stat columns

  return (
    <Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...styles.cell, ...styles.ranking }} align="center">
              #
            </TableCell>
            <TableCell sx={{ ...styles.image }}> </TableCell>
            <TableCell sx={styles.cell}>Name</TableCell>
            {smScreen && <TableCell sx={{ ...styles.cell, ...styles.country }}>Country</TableCell>}
            {smScreen && <TableCell sx={styles.cell}>Category</TableCell>}
            {smScreen && isDivisionBased && <TableCell sx={{ ...styles.cell, ...styles.division }}>Division</TableCell>}
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
            {isDivisionBased && (
              <TableCell sx={{ ...styles.cell, ...styles.divRank }}>{smScreen ? "Div Rank" : "Div #"}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {!results || results.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={totalColumns}
                align="center"
                sx={{
                  py: 4,
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No results available
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            results.map((result, index) => (
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
                  align="center"
                  sx={{
                    ...styles.cell,
                    ...styles.ranking,
                    ...(result.advancing ? styles.advancing : {}),
                    ...(result.advancingQuestionable ? styles.advancingQuestionable : {}),
                  }}
                >
                  {result.ranking === UNRANKED_POSITION
                    ? ""
                    : typeof result.ranking === "number"
                      ? result.ranking
                      : index + 1}
                </TableCell>

                <TableCell sx={{ ...styles.image }}>
                  <Avatar
                    src={withImageWidth(result.imageUrl, 96)}
                    alt={result.name}
                    sx={{ width: 32, height: 32, fontSize: "2.25rem" }}
                  />
                </TableCell>

                <TableCell sx={{ ...styles.cell, ...styles.name }}>
                  {smScreen ? (
                    <Link component={RouterLink} to={`/competitor/${result.id}`} underline="hover">
                      {result.name}
                    </Link>
                  ) : (
                    result.name
                  )}
                </TableCell>
                {smScreen && (
                  <TableCell sx={{ ...styles.cell, ...styles.country }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FlagIcon code={result.country?.code?.toLowerCase()} />
                      <Typography variant="body2" sx={{ color: "text.primary" }} noWrap>
                        {result.country?.name ?? "—"}
                      </Typography>
                    </Box>
                  </TableCell>
                )}
                {smScreen && <TableCell sx={{ ...styles.cell }}>{result.category}</TableCell>}
                {smScreen && isDivisionBased && (
                  <TableCell sx={{ ...styles.cell }}>
                    <Box display="flex" alignItems="center">
                      {result.calculatedDivision || "N/A"}
                      {renderDivisionChangeIcon(result.divisionChange)}
                    </Box>
                  </TableCell>
                )}
                {smScreen &&
                  paddedAttemptResults(result, format.numberOfAttempts).map((attemptResult, index) => (
                    <TableCell key={index} align="right" sx={styles.cell}>
                      {formatCellValue(attemptResult, eventId)}
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
                {isDivisionBased && (
                  <TableCell align="center" sx={{ ...styles.cell, ...styles.divRank }}>
                    {index + 1}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
});

RoundResultsTable.displayName = "RoundResultsTable";

export default RoundResultsTable;
