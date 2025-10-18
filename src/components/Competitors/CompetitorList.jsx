import { useState } from "react";
import {
  Grid,
  IconButton,
  InputBase,
  List,
  ListItemIcon,
  Paper,
  Avatar,
  ListItemButton,
  Box,
  Chip,
  Typography,
  Stack,
} from "@mui/material";
import { withImageWidth } from "../../lib/utils";
import SearchIcon from "@mui/icons-material/Search";
import FlagIcon from "../FlagIcon/FlagIcon";
import CubingIcon from "../CubingIcon/CubingIcon";

const styles = {
  searchPaper: {
    p: "2px 2px 2px 16px",
    display: "inline-block",
  },
  fullWidth: {
    width: "100%",
  },
  listItemButton: {
    py: 1.5,
  },
  listItemIcon: {
    minWidth: { xs: 40, md: 48 },
  },
  avatar: {
    width: { xs: 32, md: 40 },
    height: { xs: 32, md: 40 },
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    mb: { xs: 0.5, md: 0 },
  },
  competitorName: {
    flex: 1,
    mr: 1,
  },
  countryContainer: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    flexShrink: 0,
  },
  countryName: {
    display: { xs: "none", sm: "block" },
    fontSize: { sm: "0.75rem", md: "0.875rem" },
  },
  bottomRow: {
    display: "flex",
    alignItems: "center",
    mt: { xs: 0.5, md: 0 },
  },
  eventsStack: {
    flexWrap: "wrap",
    gap: 0.3,
    maxWidth: "100%",
  },
  eventChip: {
    fontSize: { xs: "0.65rem", md: "0.7rem" },
    height: { xs: 18, md: 20 },
    "& .MuiChip-icon": {
      fontSize: { xs: 10, md: 12 },
    },
    "& .MuiChip-label": {
      px: { xs: 0.5, md: 1 },
    },
  },
  moreEventsChip: {
    fontSize: { xs: "0.65rem", md: "0.7rem" },
    height: { xs: 18, md: 20 },
    "& .MuiChip-label": {
      px: { xs: 0.5, md: 1 },
    },
  },
  noEventsText: {
    fontSize: { xs: "0.75rem", md: "0.875rem" },
  },
};

function searchCompetitors(competitors, search) {
  const searchParts = search.toLowerCase().split(/\s+/);
  return competitors.filter((competitor) => searchParts.every((part) => competitor.name.toLowerCase().includes(part)));
}

function CompetitorList({ competitors }) {
  const [search, setSearch] = useState("");

  const filteredCompetitors = searchCompetitors(competitors, search).sort((a, b) => a.name.localeCompare(b.name));

  const getEventDisplayName = (eventId) => {
    const eventMap = {
      222: "2x2x2",
      333: "3x3x3",
      pyram: "Pyraminx",
    };
    return eventMap[eventId] || eventId.toUpperCase();
  };

  return (
    <Grid container direction="column" alignItems="center" spacing={1}>
      <Grid item>
        <Paper sx={styles.searchPaper}>
          <InputBase
            autoFocus
            value={search}
            placeholder="Search competitor"
            onChange={(event) => setSearch(event.target.value)}
          />
          <IconButton disabled size="large">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Grid>
      <Grid item sx={styles.fullWidth}>
        <List>
          {filteredCompetitors.map((competitor) => (
            <ListItemButton key={competitor.id} sx={styles.listItemButton}>
              {/* Profile picture */}
              <ListItemIcon sx={styles.listItemIcon}>
                <Avatar src={withImageWidth(competitor.imageUrl, 40)} alt={competitor.name} sx={styles.avatar} />
              </ListItemIcon>

              {/* Main content - responsive layout */}
              <Box sx={styles.mainContent}>
                {/* Top row: Name and Country */}
                <Box sx={styles.topRow}>
                  <Box sx={styles.competitorName}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight="medium" noWrap>
                        {competitor.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        ID: {competitor.id}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Country - always visible but responsive */}
                  <Box sx={styles.countryContainer}>
                    <FlagIcon code={competitor.country?.code?.toLowerCase()} />
                    <Typography variant="body2" color="text.secondary" sx={styles.countryName} noWrap>
                      {competitor.country?.name ?? ""}
                    </Typography>
                  </Box>
                </Box>

                {/* Bottom row: Events - mobile optimized */}
                <Box sx={styles.bottomRow}>
                  {competitor.events && competitor.events.length > 0 ? (
                    <Stack direction="row" spacing={0.3} sx={styles.eventsStack}>
                      {competitor.events.map((eventId) => (
                        <Chip
                          key={eventId}
                          icon={<CubingIcon eventId={eventId} small />}
                          label={getEventDisplayName(eventId)}
                          size="small"
                          variant="outlined"
                          sx={styles.eventChip}
                        />
                      ))}
                      {competitor.events.length > 4 && (
                        <Chip
                          label={`+${competitor.events.length - 4}`}
                          size="small"
                          variant="outlined"
                          sx={styles.moreEventsChip}
                        />
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={styles.noEventsText}>
                      No events
                    </Typography>
                  )}
                </Box>
              </Box>
            </ListItemButton>
          ))}
        </List>
      </Grid>
    </Grid>
  );
}

export default CompetitorList;
