import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FlagIcon from "../FlagIcon/FlagIcon";
import CubingIcon from "../CubingIcon/CubingIcon";
import { withImageWidth } from "../../lib/utils";

function CompetitorDialog({ competitor, onClose }) {
  const imageUrlWithWidth = withImageWidth(competitor?.imageUrl, 100);
  const navigate = useNavigate();

  const getEventDisplayName = (eventId) => {
    const eventMap = {
      222: "2x2x2",
      333: "3x3x3",
      pyram: "Pyraminx",
    };
    return eventMap[eventId] || String(eventId).toUpperCase();
  };

  const mode = competitor?.modeOfParticipation ?? "";
  const gender = competitor?.gender ?? "";
  const category = competitor?.category ?? "";

  const modeLabelMap = {
    onsite: "Onsite",
    online: "Online",
  };

  const genderLabelMap = {
    male: "Male",
    female: "Female",
    other: "Other",
  };

  const categoryLabelMap = {
    "B-8": "Below 8",
    "8-12": "8 - 12",
    "A-13": "Above 13",
  };

  const modeLabel = modeLabelMap[mode] ?? (mode ? String(mode) : "");
  const genderLabel = genderLabelMap[gender] ?? (gender ? String(gender) : "");
  const categoryLabel = categoryLabelMap[category] ?? (category ? String(category) : "");

  return (
    <Dialog
      open={!!competitor}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "auto", sm: "100%" }, maxWidth: { xs: "auto", sm: 400 }, mx: { xs: "none", sm: "auto" } },
      }}
    >
      {!!competitor && (
        <>
          <DialogTitle>
            <Box display="flex" alignItems="center" flexDirection="column" gap={1}>
              {imageUrlWithWidth && (
                <Avatar
                  src={imageUrlWithWidth}
                  alt={competitor.name}
                  sx={{ width: 96, height: 96, fontSize: "2.25rem" }}
                />
              )}
              <Typography variant="h6" noWrap>
                {competitor.name}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" spacing={2}>
              {/* image shown in title */}
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">ID</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {competitor.id ?? "—"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Country</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FlagIcon code={competitor.country?.code?.toLowerCase()} />
                      <Typography variant="body2" sx={{ color: "text.primary" }} noWrap>
                        {competitor.country?.name ?? "—"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Nationality</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FlagIcon code={competitor.nationality?.code?.toLowerCase()} />
                      <Typography variant="body2" sx={{ color: "text.primary" }} noWrap>
                        {competitor.nationality?.name ?? "—"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Gender</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {genderLabel || "—"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Age Category</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {categoryLabel || "—"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Mode</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {modeLabel || "—"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Events</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    {competitor.events && competitor.events.length > 0 ? (
                      <Box>
                        <Stack direction="row" spacing={0.3} sx={{ flexWrap: "wrap", gap: 0.3 }}>
                          {competitor.events.map((eventId) => (
                            <Chip
                              key={eventId}
                              icon={<CubingIcon eventId={eventId} small />}
                              label={getEventDisplayName(eventId)}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No events
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={onClose}>
              Close
            </Button>
            <Button
              color="primary"
              onClick={() => {
                if (competitor?.id) {
                  onClose?.();
                  navigate(`/competitor/${competitor.id}`);
                }
              }}
            >
              View Results
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export default CompetitorDialog;
