import { Link as RouterLink, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  ButtonBase,
  Chip,
  Divider,
  Grid,
  Link,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import CubingIcon from "../CubingIcon/CubingIcon";
import Error from "../Error/Error";
import FlagIcon from "../FlagIcon/FlagIcon";
import Loading from "../Loading/Loading";
import { formatAttemptResult } from "../../lib/attempt-result";
import { getEventLeaderboard } from "../../lib/firebase/firestore";
import { splitResultsByDivision, withImageWidth } from "../../lib/utils";

const styles = {
  cell: {
    pr: { xs: "6px", md: "16px" },
    pl: { xs: "10px", md: "16px" },
    "&:last-child": {
      pr: 2,
    },
  },
  ranking: {
    width: { xs: 40, md: 56 },
  },
  image: {
    width: 32,
    p: 0.5,
    pr: { xs: 1, md: 2 },
    pl: { xs: 1, md: 2 },
  },
  name: {
    minWidth: { md: 240 },
    maxWidth: { xs: 180, md: 280 },
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  country: {
    width: { xs: 120, md: 200 },
    minWidth: { md: 200 },
    maxWidth: { xs: 120, md: 200 },
  },
  roundScore: {
    minWidth: 104,
  },
  stat: {
    minWidth: 96,
  },
};

function rankValue(entry) {
  return typeof entry.cumulativeRanking === "number" ? entry.cumulativeRanking : Number.MAX_SAFE_INTEGER;
}

function scoreValue(value, eventId) {
  if (typeof value !== "number") return "";
  return formatAttemptResult(value, eventId);
}

function cumulativeRoundScore(roundScore) {
  if (!roundScore) return 0;
  return roundScore.cumulativeScore !== undefined
    ? roundScore.cumulativeScore
    : (roundScore.average ?? 0);
}

function roundScoreText(value, eventId) {
  return value === 0 ? "-" : formatAttemptResult(value, eventId);
}

function entryDivision(entry, isDivisionBased) {
  return isDivisionBased ? entry.calculatedDivision : entry.registeredDivision;
}

function sortRounds(rounds) {
  return [...rounds].sort((roundA, roundB) => {
    const orderA = roundA.number ?? roundA.roundNumber ?? Number.MAX_SAFE_INTEGER;
    const orderB = roundB.number ?? roundB.roundNumber ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;
    return String(roundA.id).localeCompare(String(roundB.id));
  });
}

function sortLeaderboard(leaderboard) {
  return [...leaderboard].sort((entryA, entryB) => {
    const rankDiff = rankValue(entryA) - rankValue(entryB);
    if (rankDiff !== 0) return rankDiff;

    const scoreA = entryA.overallCumulativeScore === -1 ? Number.MAX_SAFE_INTEGER : entryA.overallCumulativeScore;
    const scoreB = entryB.overallCumulativeScore === -1 ? Number.MAX_SAFE_INTEGER : entryB.overallCumulativeScore;
    if (scoreA !== scoreB) return scoreA - scoreB;

    return String(entryA.name).localeCompare(String(entryB.name));
  });
}

function CumulativeScoreCell({ entry, eventId, rounds }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const popoverId = open
    ? `score-breakdown-${entry.userId || entry.id}`
    : undefined;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ButtonBase
        aria-describedby={popoverId}
        aria-label={`Show score breakdown for ${entry.name}`}
        onClick={handleOpen}
        sx={{
          borderRadius: 1,
          color: "inherit",
          display: "inline-flex",
          font: "inherit",
          fontWeight: 600,
          justifyContent: "flex-end",
          minHeight: 28,
          px: 0.75,
          textAlign: "right",
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        {scoreValue(entry.overallCumulativeScore, eventId)}
      </ButtonBase>

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "center", horizontal: "left" }}
        transformOrigin={{ vertical: "center", horizontal: "right" }}
        PaperProps={{
          sx: {
            borderRadius: 1.5,
            boxShadow: 3,
            minWidth: 224,
            p: 1.5,
          },
        }}
      >
        <Box sx={{ display: "grid", gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              letterSpacing: 0.4,
            }}
          >
            SCORE BREAKDOWN
          </Typography>

          <Divider />

          <Box sx={{ display: "grid", gap: 0.75 }}>
            {rounds.map((round) => {
              const roundScore = entry.roundScores?.[round.id];
              const value = cumulativeRoundScore(roundScore);
              const muted = !roundScore || value === 0;
              const dnf = value === -1;

              return (
                <Box
                  key={round.id}
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    gap: 2,
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {round.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: muted
                        ? "text.secondary"
                        : dnf
                          ? "error.main"
                          : "text.primary",
                      fontWeight: 600,
                    }}
                  >
                    {roundScoreText(value, eventId)}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Divider />

          {entry.overallCumulativeScore === -1 ? (
            <Typography variant="caption" sx={{ color: "error.main" }}>
              DNF - at least one round has all-invalid attempts
            </Typography>
          ) : entry.overallCumulativeScore === 0 ? (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              No scored attempts yet
            </Typography>
          ) : (
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                gap: 2,
                justifyContent: "space-between",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Mean of {entry.roundsAttempted} round
                {entry.roundsAttempted !== 1 ? "s" : ""}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                {formatAttemptResult(entry.overallCumulativeScore, eventId)}
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}

function EventLeaderboard() {
  const competitionId = "cubuzzle-s4";
  const { eventId } = useParams();
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));
  const mdScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: [competitionId, eventId, "leaderboard"],
    queryFn: async () => getEventLeaderboard(competitionId, eventId),
  });

  const rounds = useMemo(() => sortRounds(event?.rounds ?? []), [event?.rounds]);
  const leaderboard = useMemo(() => sortLeaderboard(event?.leaderboard ?? []), [event?.leaderboard]);
  const isDivisionBased = event?.divisionBased === true || event?.id === "333";
  const divisionLeaderboard = useMemo(() => {
    if (isDivisionBased && leaderboard.length > 0) {
      return splitResultsByDivision(leaderboard);
    } else {
      return [
        {
          name: "All",
          results: leaderboard,
        },
      ];
    }
  }, [leaderboard, isDivisionBased]);

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  const totalColumns =
    4 + // rank, avatar, name, rounds
    (smScreen ? 2 : 0) + // country, division
    (mdScreen ? 1 : 0) + // best average
    1; // cumulative score

  return (
    <Grid container direction="column" spacing={2} sx={{ width: "100%", maxWidth: "100%" }}>
      <Grid item container alignItems="center" spacing={1}>
        <Grid item>
          <CubingIcon eventId={event.id} />
        </Grid>
        <Grid item xs>
          <Typography variant="h5">{event.name} Leaderboard</Typography>
        </Grid>
      </Grid>

      {divisionLeaderboard.map((division) => {
        const divisionIsUnknown = division.name === "Unknown";
        const divisionLabel = divisionIsUnknown ? "DNF/DNS" : `Division ${division.name}`;
        const timeLabel = !divisionIsUnknown && division.time ? ` (${division.time})` : "";
        return (
          <Grid item key={division.name} sx={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
            {isDivisionBased && divisionLeaderboard.length > 1 && division.name !== "All" && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" component="h3">
                  {divisionLabel}
                  <Typography variant="subtitle1" color="textSecondary" component="span">
                    {timeLabel}
                  </Typography>
                </Typography>
              </Box>
            )}
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...styles.cell, ...styles.ranking }} align="center">
                      #
                    </TableCell>
                    <TableCell sx={styles.image}> </TableCell>
                    <TableCell sx={{ ...styles.cell, ...styles.name }}>Name</TableCell>
                    {smScreen && <TableCell sx={{ ...styles.cell, ...styles.country }}>Country</TableCell>}
                    {smScreen && <TableCell sx={styles.cell}>Division</TableCell>}
                    <TableCell sx={{ ...styles.cell, ...styles.stat }} align="right">
                      Rounds
                    </TableCell>
                    {mdScreen && (
                      <TableCell sx={{ ...styles.cell, ...styles.stat }} align="right">
                        Best Avg
                      </TableCell>
                    )}
                    <TableCell sx={{ ...styles.cell, ...styles.stat }} align="right">
                      Cumulative
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {division.results.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={totalColumns} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No leaderboard entries available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    division.results.map((entry, index) => (
                      <TableRow
                        key={entry.userId || entry.id}
                        hover
                        sx={{
                          whiteSpace: "nowrap",
                          "&:last-child td": { border: 0 },
                        }}
                      >
                        <TableCell align="center" sx={{ ...styles.cell, ...styles.ranking }}>
                          {typeof entry.cumulativeRanking === "number" ? entry.cumulativeRanking : index + 1}
                        </TableCell>
                        <TableCell sx={styles.image}>
                          <Avatar
                            src={withImageWidth(entry.imageUrl, 96)}
                            alt={entry.name}
                            sx={{ width: 32, height: 32, fontSize: "2.25rem" }}
                          />
                        </TableCell>
                        <TableCell sx={{ ...styles.cell, ...styles.name }}>
                          {smScreen ? (
                            <Link component={RouterLink} to={`/competitor/${entry.userId}`} underline="hover">
                              {entry.name}
                            </Link>
                          ) : (
                            entry.name
                          )}
                        </TableCell>
                        {smScreen && (
                          <TableCell sx={{ ...styles.cell, ...styles.country }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <FlagIcon code={entry.country?.code?.toLowerCase()} />
                              <Typography variant="body2" sx={{ color: "text.primary" }} noWrap>
                                {entry.country?.name ?? "-"}
                              </Typography>
                            </Box>
                          </TableCell>
                        )}
                        {smScreen && (
                          <TableCell sx={styles.cell}>
                            {entryDivision(entry, isDivisionBased) ? <Chip label={entryDivision(entry, isDivisionBased)} size="small" /> : "-"}
                          </TableCell>
                        )}
                        <TableCell sx={{ ...styles.cell, ...styles.stat }} align="right">
                          <Chip label={` ${entry.roundsAttempted}/3`} size="small" />
                        </TableCell>
                        {mdScreen && (
                          <TableCell sx={{ ...styles.cell, ...styles.stat }} align="right">
                            {scoreValue(entry.bestAverage, event.id)}
                          </TableCell>
                        )}
                        <TableCell
                          sx={{ ...styles.cell, ...styles.stat, fontWeight: 600 }}
                          align="right"
                        >
                          <CumulativeScoreCell
                            entry={entry}
                            eventId={event.id}
                            rounds={rounds}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default EventLeaderboard;
