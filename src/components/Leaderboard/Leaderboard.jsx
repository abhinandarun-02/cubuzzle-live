import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Container,
  Typography,
  Paper,
  InputBase,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getUnifiedLeaderboard } from "../../lib/firebase/firestore";
import LeaderboardTable from "./LeaderboardTable";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import useDebounce from "../../hooks/useDebounce";

const styles = {
  header: {
    mb: 3,
    mt: 1,
  },
  titleBox: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    mb: 2,
  },
  titleIcon: {
    fontSize: { xs: "2rem", md: "2.5rem" },
    color: "primary.main",
  },
  searchPaper: {
    p: "4px 8px",
    display: "flex",
    alignItems: "center",
    mb: 2,
  },
  statsBox: {
    display: "flex",
    gap: 2,
    flexWrap: "wrap",
    mb: 3,
    p: 2,
    borderRadius: 2,
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
  },
  filterSection: {
    mb: 3,
  },
};

function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: leaderboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["unified-leaderboard"],
    queryFn: getUnifiedLeaderboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  // Filter logic
  const filteredEntries = leaderboardData?.filter((entry) => {
    // Search filter
    const matchesSearch =
      !debouncedSearchQuery ||
      entry.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      entry.profile?.country?.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

    // Division filter
    const matchesDivision =
      divisionFilter === "all" ||
      entry.division?.calculated === divisionFilter ||
      entry.division?.registered === divisionFilter;

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || entry.profile?.category === categoryFilter;

    return matchesSearch && matchesDivision && matchesCategory;
  }) || [];

  // Get unique divisions and categories for filters
  const divisions = [
    "all",
    ...new Set(
      leaderboardData
        ?.map((e) => e.division?.calculated)
        .filter(Boolean)
    ),
  ];

  const categories = [
    "all",
    ...new Set(
      leaderboardData
        ?.map((e) => e.profile?.category)
        .filter(Boolean)
    ),
  ];

  // Calculate stats
  const stats = {
    totalCompetitors: leaderboardData?.length || 0,
    filteredCompetitors: filteredEntries.length,
    topAverage: filteredEntries[0]?.performance?.average,
    competitions: new Set(leaderboardData?.map((e) => e.source?.compId).filter(Boolean)).size,
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={styles.header}>
        {/* Title */}
        <Box sx={styles.titleBox}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.75rem", md: "2.125rem" },
              }}
            >
              Leaderboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Combined rankings from multiple competitions
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={styles.statsBox}>
          <Box sx={styles.statItem}>
            <Typography variant="caption" color="text.secondary">
              Total Competitors
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {stats.totalCompetitors}
            </Typography>
          </Box>
          <Box sx={styles.statItem}>
            <Typography variant="caption" color="text.secondary">
              Showing
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {stats.filteredCompetitors}
            </Typography>
          </Box>
          <Box sx={styles.statItem}>
            <Typography variant="caption" color="text.secondary">
              Competitions
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {stats.competitions}
            </Typography>
          </Box>
        </Box>

        {/* Search */}
        <Paper elevation={1} sx={styles.searchPaper}>
          <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
          <InputBase
            placeholder="Search by name or country..."
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
          />
        </Paper>

        {/* Filters */}
        <Box sx={styles.filterSection}>
          <Stack spacing={2}>
            {/* Division Filter */}
            {divisions.length > 1 && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ mb: 1, display: "block", fontWeight: 600 }}
                >
                  Division
                </Typography>
                <ToggleButtonGroup
                  value={divisionFilter}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) setDivisionFilter(newValue);
                  }}
                  size="small"
                  sx={{ flexWrap: "wrap" }}
                >
                  {divisions.map((division) => (
                    <ToggleButton
                      key={division}
                      value={division}
                      sx={{ textTransform: "none", px: 2 }}
                    >
                      {division === "all" ? "All" : division}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            )}

            {/* Category Filter */}
            {categories.length > 1 && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ mb: 1, display: "block", fontWeight: 600 }}
                >
                  Category
                </Typography>
                <ToggleButtonGroup
                  value={categoryFilter}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) setCategoryFilter(newValue);
                  }}
                  size="small"
                  sx={{ flexWrap: "wrap" }}
                >
                  {categories.map((category) => (
                    <ToggleButton
                      key={category}
                      value={category}
                      sx={{ textTransform: "none", px: 2 }}
                    >
                      {category === "all" ? "All" : category}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Active Filters Display */}
        {(divisionFilter !== "all" || categoryFilter !== "all") && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
            {divisionFilter !== "all" && (
              <Chip
                label={`Division: ${divisionFilter}`}
                onDelete={() => setDivisionFilter("all")}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {categoryFilter !== "all" && (
              <Chip
                label={`Category: ${categoryFilter}`}
                onDelete={() => setCategoryFilter("all")}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        )}
      </Box>

      {/* Results */}
      {filteredEntries.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No competitors found matching your filters. Try adjusting your search or filter criteria.
        </Alert>
      ) : (
        <LeaderboardTable entries={filteredEntries} eventId="333" />
      )}
    </Container>
  );
}

export default Leaderboard;
