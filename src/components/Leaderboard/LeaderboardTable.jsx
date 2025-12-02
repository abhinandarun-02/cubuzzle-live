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
  },
  image: {
    width: 32,
    p: 0.5,
    pr: { xs: 1, md: 2 },
    pl: { xs: 1, md: 2 },
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
    minWidth: { md: 250 },
    width: { xl: "25%" },
    maxWidth: { xs: 200, md: 300, xl: 350 },
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
    <TableContainer component={Paper} elevation={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={styles.ranking}>Rank</TableCell>
            <TableCell sx={styles.image} />
            <TableCell sx={styles.name}>Name</TableCell>
            <TableCell sx={styles.country}>Country</TableCell>
            <TableCell sx={styles.result} align="right">
              Average
            </TableCell>
           
            <TableCell sx={{ ...styles.division, display: { xs: "none", lg: "table-cell" } }}>
              Division
            </TableCell>
            <TableCell sx={{ ...styles.category, display: { xs: "none", lg: "table-cell" } }}>
              Category
            </TableCell>
           
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => {
            const advancing = entry.status?.advancing;
            const advancingQuestionable = entry.status?.advancingQuestionable;
            const rowSx = advancing
              ? styles.advancing
              : advancingQuestionable
              ? styles.advancingQuestionable
              : {};

            return (
              <TableRow key={entry.id} hover sx={rowSx}>
                <TableCell sx={styles.ranking}>
                  {entry.leaderboardRanking || "-"}
                </TableCell>
                <TableCell sx={styles.image}>
                  <Avatar
                    src={withImageWidth(entry.profile?.imageUrl, 80)}
                    sx={{ width: 32, height: 32 }}
                  />
                </TableCell>
                <TableCell sx={styles.name}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Link
                      component={RouterLink}
                      to={`/competitor/${entry.id}`}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ fontWeight: 500 }}
                      >
                        {entry.name}
                      </Typography>
                    </Link>
                  </Box>
                </TableCell>
                <TableCell sx={styles.country}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagIcon code={entry.profile?.country.code} />
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ display: { xs: "none", sm: "block" } }}
                    >
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
                    {entry.division?.calculated || "-"}
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
