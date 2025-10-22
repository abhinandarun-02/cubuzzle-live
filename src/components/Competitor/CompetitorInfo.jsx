import { Box, Avatar, Grid, Typography, Paper, Divider, Chip, Stack } from "@mui/material";
import FlagIcon from "../FlagIcon/FlagIcon";
import { withImageWidth } from "../../lib/utils";
import { getEventDisplayName } from "../../lib/competition.js";

const getModeLabel = (mode) => {
  const modeMap = {
    onsite: "Onsite",
    online: "Online",
  };
  return modeMap[mode] || mode;
};

const getCategoryLabel = (category) => {
  const categoryMap = {
    "B-8": "Below 8",
    "8-12": "8 - 12",
    "A-13": "Above 13",
  };
  return categoryMap[category] || category;
};

function CompetitorInfo({ competitor }) {
  return (
    <Paper>
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 2,
          mr: "auto",
          width: "100%",
          maxWidth: { xs: "100%", md: 900, xl: 1200 },
        }}
      >
        <Grid container spacing={2} alignItems="stretch">
          {/* Left column */}
          <Grid item xs={12} sm={4}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems={{ xs: "center", sm: "flex-start" }}
              sx={{ px: { xs: 0, sm: 1 } }}
            >
              <Avatar
                src={withImageWidth(competitor.imageUrl, 512)}
                alt={competitor.name}
                sx={{
                  width: { xs: 96, sm: 120, md: 140, lg: 160 },
                  height: { xs: 96, sm: 120, md: 140, lg: 160 },
                  fontSize: { xs: "2.5rem", md: "3rem" },
                }}
                variant="rounded"
              />

              <Box textAlign={{ xs: "center", sm: "left" }} mt={1}>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}>
                    {competitor.name}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mt={0.75}>
                  <FlagIcon code={competitor.country?.code?.toLowerCase()} sx={{ fontSize: { xl: 28 } }} />
                  <Typography variant="body2" sx={{ fontSize: { xs: "0.95rem", md: "1rem" }, fontWeight: 500 }}>
                    {competitor.country?.name}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Horizontal divider for sm- */}
          <Grid item sx={{ display: { xs: "flex", sm: "none" } }} xs={12}>
            <Divider style={{ width: "100%" }} />
          </Grid>

          {/* Vertical divider for sm+ */}
          <Grid item sx={{ display: { xs: "none", sm: "flex" } }} sm={1} alignItems="stretch">
            <Divider orientation="vertical" flexItem />
          </Grid>

          {/* Right column */}
          <Grid item xs={12} sm={7}>
            <Grid container spacing={{ xs: 2, md: 4 }}>
              {/* Cubuzzle ID */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" display="block">
                  Cubuzzle ID
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, fontSize: { xs: "0.95rem", md: "1.05rem" }, color: "text.secondary", fontWeight: 500 }}
                >
                  {competitor.id}
                </Typography>
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" display="block">
                  Category
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {getCategoryLabel(competitor.category)}
                </Typography>
              </Grid>

              {/* Mode of Participation */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" display="block">
                  Mode of Participation
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, fontSize: { xs: "0.95rem", md: "1.05rem" }, color: "text.secondary", fontWeight: 500 }}
                >
                  {getModeLabel(competitor.modeOfParticipation)}
                </Typography>
              </Grid>

              {/* Events */}
              {competitor.events && competitor.events.length > 0 && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Events</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    {competitor.events.map((event) => (
                      <Chip
                        key={event}
                        label={getEventDisplayName(event)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                      />
                    ))}
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default CompetitorInfo;
