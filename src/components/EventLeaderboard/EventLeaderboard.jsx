import { Link as RouterLink, useParams } from "react-router-dom";
import { useMemo } from "react";
import {
  Avatar,
  Box,
  Chip,
  Grid,
  Link,
  Paper,
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
import { withImageWidth } from "../../lib/utils";

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

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  const visibleRounds = mdScreen ? rounds : [];
  const totalColumns =
    3 + // rank, avatar, name
    (smScreen ? 1 : 0) + // country
    2; // best average, cumulative score

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

      <Grid item sx={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
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
                <TableCell sx={{ ...styles.cell, ...styles.stat }} align="right">
                  Best Avg
                </TableCell>
                <TableCell sx={{ ...styles.cell, ...styles.stat }} align="right">
                  Cumulative
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={totalColumns} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No leaderboard entries available
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard.map((entry, index) => (
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
                        {entry.registeredDivision ? <Chip label={entry.registeredDivision} size="small" /> : "-"}
                      </TableCell>
                    )}
                    <TableCell sx={{ ...styles.cell, ...styles.stat }} align="right">
                      <Chip label={` ${entry.roundsAttempted}/3`} size="small" />
                    </TableCell>
                    <TableCell sx={{ ...styles.cell, ...styles.stat }} align="right">
                      {scoreValue(entry.bestAverage, event.id)}
                    </TableCell>
                    <TableCell sx={{ ...styles.cell, ...styles.stat, fontWeight: 600 }} align="right">
                      {scoreValue(entry.overallCumulativeScore, event.id)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}

export default EventLeaderboard;
