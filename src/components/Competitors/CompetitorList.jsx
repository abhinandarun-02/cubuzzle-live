import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Paper,
  Typography,
  Chip,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { withImageWidth } from "../../lib/utils";
import FlagIcon from "../FlagIcon/FlagIcon";
import CubingIcon from "../CubingIcon/CubingIcon";
import { getEventDisplayName } from "../../lib/competition";

const EVENT_LIMIT = 5;

function searchCompetitors(competitors, search) {
  if (!search) return competitors;
  const searchParts = search.toLowerCase().split(/\s+/);
  return competitors.filter((competitor) =>
    searchParts.every((part) => competitor.name.toLowerCase().includes(part))
  );
}

function CompetitorList({ competitors }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  const filteredCompetitors = useMemo(() => 
    searchCompetitors(competitors, search).sort((a, b) => a.name.localeCompare(b.name)),
    [competitors, search]
  );

  const handleClearSearch = () => setSearch("");

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", p: { xs: 1, sm: 2 } }}>
      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: "100%",
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          transition: "box-shadow 0.3s ease",
          background: theme.palette.background.paper,
          "&:focus-within": {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.grey[700], 0.25)}`,
            borderColor: alpha(theme.palette.grey[700], 0.5),
          },
        }}
      >
        <IconButton sx={{ p: "10px" }} aria-label="search" disabled>
          <SearchIcon color="action" />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search competitors..."
          inputProps={{ "aria-label": "search competitors" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <IconButton sx={{ p: "10px" }} aria-label="clear" onClick={handleClearSearch}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>

      {/* Competitor List */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper'
        }}
      >
        {filteredCompetitors.length > 0 ? (
          <List disablePadding>
            {filteredCompetitors.map((competitor, index) => (
              <Box key={competitor.id}>
                <ListItemButton
                  onClick={() => navigate(`/competitor/${competitor.id}`)}
                  sx={{
                    py: 2,
                    px: { xs: 2, sm: 3 },
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: { xs: 48, sm: 56 } }}>
                    <Avatar
                      src={withImageWidth(competitor.imageUrl, 80)}
                      alt={competitor.name}
                      sx={{ 
                        width: { xs: 40, sm: 48 }, 
                        height: { xs: 40, sm: 48 },
                        border: `2px solid ${theme.palette.background.paper}`,
                        boxShadow: theme.shadows[1]
                      }}
                    />
                  </ListItemAvatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="600" noWrap sx={{ mr: 1, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                        {competitor.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8, flexShrink: 0 }}>
                        <FlagIcon code={competitor.country?.code?.toLowerCase()} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                          {competitor.country?.name}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      {competitor.events && competitor.events.length > 0 ? (
                        <>
                          {competitor.events.slice(0, EVENT_LIMIT).map((eventId) => (
                            <Chip
                              key={eventId}
                              icon={<CubingIcon eventId={eventId} small style={{ opacity: 0.7 }} />}
                              label={getEventDisplayName(eventId)}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                borderColor: alpha(theme.palette.divider, 0.8),
                                '& .MuiChip-icon': { ml: 0.5, width: 14, height: 14 },
                                '& .MuiChip-label': { px: 0.8 },
                              }}
                            />
                          ))}
                          {competitor.events.length > EVENT_LIMIT && (
                            <Chip
                              label={`+${competitor.events.length - EVENT_LIMIT}`}
                              size="small"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          No events registered
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </ListItemButton>
                {index < filteredCompetitors.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
            <SearchIcon sx={{ fontSize: 48, mb: 1, opacity: 0.2 }} />
            <Typography variant="body1">
              No competitors found matching "{search}"
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default CompetitorList;
