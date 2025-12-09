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
import { formatCellValue } from "../../lib/attempt-result";

const styles = {
  cell: {
    pr: { xs: "8px", md: "16px" },
    pl: { xs: "12px", md: "16px" },
    "&:last-child": {
      pr: 2,
    },
    whiteSpace: "nowrap",
  },

  ranking: {
    pr: { xs: 1, md: 2 },
    width: { xs: 40, md: 60 },
    fontWeight: 600,
  },
  name: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    pr: 1,
    pl: { xs: 1, md: 2 },
    minWidth: { md: 280 },
    width: { xl: "25%" },
    maxWidth: { xs: 220, md: 350, xl: 400 },
  },
  country: {
    width: { xs: 120, md: 200 },
    minWidth: { md: 180 },
    maxWidth: { xs: 120, md: 200 },
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  result: {
    width: { xs: 80, md: 100, xl: 120 },
    maxWidth: { xs: 80, md: 100, xl: 120 },
    fontWeight: 500,
  },
  division: {
    width: { md: 120 },
  },
  category: {
    width: { md: 140 },
  },
  sourceChip: {
    fontSize: "0.7rem",
    height: 20,
  },
};

const LeaderboardTable = memo(({ entries, eventId = "333" }) => {
  return (
    <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto" }}>
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell sx={styles.ranking}>Rank</TableCell>
            <TableCell sx={styles.name}>Name</TableCell>
            <TableCell sx={styles.country}>Country</TableCell>
            <TableCell sx={styles.result} align="right">
              Average
            </TableCell>

            <TableCell sx={{ ...styles.division, display: { xs: "none", lg: "table-cell" } }}>Division</TableCell>
            <TableCell sx={{ ...styles.category, display: { xs: "none", lg: "table-cell" } }}>Category</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => {
            const advancing = entry.status?.advancing;
            const advancingQuestionable = entry.status?.advancingQuestionable;
            const rowSx = advancing ? styles.advancing : advancingQuestionable ? styles.advancingQuestionable : {};

            return (
              <TableRow key={entry.id} hover sx={rowSx}>
                <TableCell sx={styles.ranking}>{entry.leaderboardRanking || "-"}</TableCell>
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
                    <Typography variant="body2" noWrap sx={{ display: { xs: "none", sm: "block" } }}>
                      {entry.profile?.country.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={styles.result} align="right">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCellValue(entry.average, eventId)}
                  </Typography>
                </TableCell>

                <TableCell sx={{ ...styles.division, display: { xs: "none", lg: "table-cell" } }}>
                  <Typography variant="body2" noWrap>
                    {entry.division || "-"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...styles.category, display: { xs: "none", lg: "table-cell" } }}>
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
