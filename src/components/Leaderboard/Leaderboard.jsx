import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
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
  Tabs,
  Tab,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { getUnifiedLeaderboard } from "../../lib/firebase/firestore";
import LazyDivisionSection from "./LazyDivisionSection";
import LeaderboardTable from "./LeaderboardTable";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import useDebounce from "../../hooks/useDebounce";
import { getEventDisplayName } from "../../lib/competition";
import { formatAttemptResult } from "../../lib/attempt-result";
import CubingIcon from "../CubingIcon/CubingIcon";

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
    backgroundColor: (theme) => (theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"),
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
  },
  filterSection: {
    mb: 3,
  },
  eventTabs: {
    mb: 3,
    borderBottom: 1,
    borderColor: "divider",
    "& .MuiTab-root": {
      color: "text.secondary",
      "&.Mui-selected": {
        color: "text.primary",
      },
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "text.primary",
    },
  },
  eventTab: {
    textTransform: "none",
    minHeight: 48,
    fontWeight: 500,
  },
  externalMenuButton: {
    textTransform: "none",
    color: "text.primary",
    borderColor: "divider",
    fontSize: "1.25rem",
    padding: "12px 24px",
    "&:hover": {
      borderColor: "text.secondary",
      backgroundColor: "action.hover",
    },
  },
  menuPaper: {
    fontSize: "1.25rem",
    padding: "12px 0",
  },
  menuItem: {
    fontSize: "1.15rem",
    padding: "14px 32px",
  },
  exportButton: {
    textTransform: "none",
    color: "text.primary",
    borderColor: "divider",
    "&:hover": {
      borderColor: "text.secondary",
      backgroundColor: "action.hover",
    },
  },
};

const EVENTS = [
  { id: "333", name: "3x3x3 Cube", divisionBased: true },
  { id: "222", name: "2x2x2 Cube", divisionBased: false },
  { id: "444", name: "4x4x4 Cube", divisionBased: false },
  { id: "pyram", name: "Pyraminx", divisionBased: false },
  { id: "skewb", name: "Skewb", divisionBased: false },
  {id: "minx", name: "Megaminx", divisionBased: false},
  {id: "333oh", name: "3x3x3 One-Handed", divisionBased: false},
];

const EXTERNAL_LEADERBOARDS = [
  { name: "Cubuzzle Champion League - Season 1", url: "  https://cubuzzle-champion-league-s1.vercel.app/" },
  { name: "Cubuzzle Champion League - Season 2", url: "  https://cubuzzle-champion-league-s2.vercel.app/" },
  { name: "Cubuzzle Champion League - Season 3", url: "https://cubuzzle-champion-league-s3.vercel.app/" },
  { name: "Cubuzzle Champion League - Season 4 Qualifiers", url: "https://cubuzzle-champion-league-s4.vercel.app/" },
  { name: "Cubuzzle Champion League - Season 4 Finals", url: "https://cubuzzle-champion-league-s4-finals.vercel.app/" }
];

function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0].id);
  const [anchorEl, setAnchorEl] = useState(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Export to CSV function
  const exportToCSV = (entries, eventId, isDivisionBased) => {
    const headers = isDivisionBased
      ? ["Rank", "Name", "Cubuzzle ID", "Country", "Average", "Division", "Category"]
      : ["Rank", "Name", "Cubuzzle ID", "Country", "Average", "Category"];

    const rows = entries.map((entry) => {
      const baseRow = [
        entry.leaderboardRanking || "-",
        entry.name || "-",
        entry.id || "-",
        entry.profile?.country?.name || "-",
        formatAttemptResult(entry.average, eventId),
      ];
      if (isDivisionBased) {
        baseRow.push(entry.division || "-");
      }
      baseRow.push(entry.profile?.category || "-");
      return baseRow;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leaderboard_${eventId}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExternalLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
    handleMenuClose();
  };

  // Preload all events in parallel
  const leaderboardQueries = useQueries({
    queries: EVENTS.map((event) => ({
      queryKey: ["unified-leaderboard", event.id],
      queryFn: () => getUnifiedLeaderboard(event.id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })),
  });

  // Get the current event's query result
  const currentEventIndex = EVENTS.findIndex((e) => e.id === selectedEvent);
  const currentEvent = EVENTS[currentEventIndex];
  const currentQuery = leaderboardQueries[currentEventIndex];
  const { data: leaderboardData, isLoading, isError } = currentQuery || {};

  const handleEventChange = (event, newValue) => {
    setSelectedEvent(newValue);
    setCategoryFilter("all");
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  // Filter logic
  const filteredEntries =
    leaderboardData?.filter((entry) => {
      // Search filter (guard against undefined values)
      const query = debouncedSearchQuery?.toLowerCase() || "";
      const matchesSearch =
        !query ||
        (entry.name || "").toLowerCase().includes(query) ||
        (entry.profile?.country?.name || "").toLowerCase().includes(query);

      // Category filter
      const matchesCategory = categoryFilter === "all" || entry.profile?.category === categoryFilter;

      return matchesSearch && matchesCategory;
    }) || [];

  // Group by division
  const groupedByDivision = filteredEntries.reduce((acc, entry) => {
    const division = entry.division || "Unknown";
    acc[division] = acc[division] || [];
    acc[division].push(entry);
    return acc;
  }, {});

  // Get unique categories for filters
  const categories = ["all", ...new Set(leaderboardData?.map((e) => e.profile?.category).filter(Boolean))];

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
        {/* Title and Menu Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              Cubuzzle Legacy Board
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontSize: { xs: "0.875rem", md: "1rem" }, ml: 0.5 }}
            >
              Your rank. Your legacy. Every season counts.
            </Typography>
          </Box>
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            <Button
              variant="outlined"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleMenuOpen}
              sx={styles.externalMenuButton}
            >
              Season-wise Leaderboards
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{ sx: styles.menuPaper }}
            >
              {EXTERNAL_LEADERBOARDS.map((board) => (
                <MenuItem key={board.name} onClick={() => handleExternalLink(board.url)} sx={styles.menuItem}>
                  <ListItemText>{board.name}</ListItemText>
                  <ListItemIcon sx={{ minWidth: "auto", ml: 1 }}>
                    <OpenInNewIcon fontSize="medium" />
                  </ListItemIcon>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        {/* Event Tabs */}
        <Tabs
          value={selectedEvent}
          onChange={handleEventChange}
          sx={styles.eventTabs}
          variant="scrollable"
          scrollButtons="auto"
        >
          {EVENTS.map((event) => (
            <Tab
              key={event.id}
              value={event.id}
              label={getEventDisplayName(event.id)}
              icon={<CubingIcon eventId={event.id} small />}
              iconPosition="start"
              sx={styles.eventTab}
            />
          ))}
        </Tabs>

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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
            {/* Category Filter */}
            {categories.length > 1 && (
              <Box>
                <Typography variant="caption" sx={{ mb: 1, display: "block", fontWeight: 600 }}>
                  Age Category
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
                    <ToggleButton key={category} value={category} sx={{ textTransform: "none", px: 2 }}>
                      {category === "all" ? "All" : category}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            )}
            
            {/* Export Button */}
            <Box>
              <Typography variant="caption" sx={{ mb: 1, display: "block", fontWeight: 600 }}>
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={() => exportToCSV(filteredEntries, selectedEvent, currentEvent?.divisionBased)}
                sx={styles.exportButton}
                disabled={filteredEntries.length === 0}
              >
                Export CSV
              </Button>
            </Box>
          </Stack>
        </Box>

        {/* Active Filters Display */}
        {categoryFilter !== "all" && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`Category: ${categoryFilter}`}
              onDelete={() => setCategoryFilter("all")}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>
        )}
      </Box>

      {/* Results */}
      {filteredEntries.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No competitors found matching your filters. Try adjusting your search or filter criteria.
        </Alert>
      ) : currentEvent?.divisionBased ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {Object.keys(groupedByDivision).map((division) => (
            <LazyDivisionSection
              key={division}
              division={division}
              entries={groupedByDivision[division]}
              eventId={selectedEvent}
            />
          ))}
        </Box>
      ) : (
        <LeaderboardTable
          entries={filteredEntries}
          eventId={selectedEvent}
          isDivisionBased={currentEvent?.divisionBased}
        />
      )}
    </Container>
  );
}

export default Leaderboard;
