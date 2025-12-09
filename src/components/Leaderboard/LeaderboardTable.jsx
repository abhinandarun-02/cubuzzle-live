import { memo } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Box,
  Link,
  TableContainer,
} from "@mui/material";
import { withImageWidth } from "../../lib/utils";
import FlagIcon from "../FlagIcon/FlagIcon";
import { formatAttemptResult } from "../../lib/attempt-result";

const styles = {
  cell: {
    px: { xs: 1.5, md: 2 },
    "&:last-child": {
      pr: 3,
    },
    "&:first-of-type": {
      pl: 3,
    },
    whiteSpace: "nowrap",
  },

  ranking: {
    width: { xs: 60, md: 80 },
    fontWeight: 600,
    textAlign: "center",
  },
  name: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    minWidth: { xs: 250, md: 250 },
    maxWidth: { xs: 250, md: 320 },
  },
  country: {
    minWidth: { xs: 100, md: 160 },
    maxWidth: { xs: 160, md: 240 },
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  result: {
    width: { xs: 80, md: 100 },
    fontWeight: 500,
  },
  division: {
    width: { xs: 60, md: 80 },
    textAlign: "center",
  },
  category: {
    width: { xs: 60, md: 100 },
    textAlign: "center",
  },
  sourceChip: {
    fontSize: "0.7rem",
    height: 20,
  },
};

const LeaderboardTable = memo(({ entries, eventId = "333", isDivisionBased=true }) => {

  return (
    <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto" }}>
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell sx={styles.ranking} align="center">
              Rank
            </TableCell>
            <TableCell sx={styles.name}>Name</TableCell>
            <TableCell sx={styles.country}>Country</TableCell>
            <TableCell sx={styles.result} align="right">
              Average
            </TableCell>

            {isDivisionBased && (
              <TableCell sx={styles.division} align="center">
                Division
              </TableCell>
            )}
            <TableCell sx={styles.category} align="center">
              Category
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => {
            const advancing = entry.status?.advancing;
            const advancingQuestionable = entry.status?.advancingQuestionable;
            const rowSx = advancing ? styles.advancing : advancingQuestionable ? styles.advancingQuestionable : {};

            return (
              <TableRow key={entry.id} hover sx={rowSx}>
                <TableCell sx={styles.ranking} align="center">
                  {entry.leaderboardRanking || "-"}
                </TableCell>
                <TableCell sx={styles.name}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar src={withImageWidth(entry.profile?.imageUrl, 80)} sx={{ width: 40, height: 40 }} />
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Link
                        component={RouterLink}
                        to={`/competitor/${entry.id}`}
                        sx={{
                          textDecoration: "none",
                          color: "inherit",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {entry.name}
                        </Typography>
                      </Link>
                      <Typography variant="caption" noWrap sx={{ color: "text.secondary" }}>
                        {entry.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={styles.country}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagIcon code={entry.profile?.country.code.toLowerCase()} />
                    <Typography variant="body2" noWrap>
                      {entry.profile?.country.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={styles.result} align="right">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatAttemptResult(entry.average, eventId)}
                  </Typography>
                </TableCell>

                {isDivisionBased && (
                  <TableCell sx={styles.division} align="center">
                    <Typography variant="body2" noWrap>
                      {entry.division || "-"}
                    </Typography>
                  </TableCell>
                )}
                <TableCell sx={styles.category} align="center">
                  <Typography variant="body2" noWrap>
                    {entry.profile?.category || "-"}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

LeaderboardTable.displayName = "LeaderboardTable";

export default LeaderboardTable;
