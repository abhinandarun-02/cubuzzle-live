import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useRef } from "react";
import { Card, CardActionArea, CardContent, CardHeader, Grid, Typography, Box, Chip, Container } from "@mui/material";
import { CalendarToday as CalendarIcon, EmojiEvents as TrophyIcon } from "@mui/icons-material";
import { keyframes } from "@mui/system";
import CubingIcon from "../CubingIcon/CubingIcon";
import { flatMap } from "../../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getCompetitionDetailsById } from "../../lib/firebase/firestore";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";

// Define pulse animation
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`;

const styles = {
  container: {
    py: 3,
  },
  header: {
    mb: 4,
    textAlign: "center",
  },
  card: {
    mb: 3,
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  roundCard: {
    position: "relative",
    overflow: "hidden",
    bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.900" : "grey.50"),
    borderColor: (theme) => (theme.palette.mode === "dark" ? "grey.700" : "grey.300"),
    borderWidth: 2,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        theme.palette.mode === "dark" ? "0 4px 12px rgba(255, 255, 255, 0.1)" : "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  },
  roundCardContent: {
    textAlign: "center",
    py: 3,
  },
  liveIndicatorTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.400" : "grey.600"),
  },
  liveIndicatorDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: "50%",
    bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.400" : "grey.600"),
    animation: `${pulse} 2s ease-in-out infinite`,
  },
  liveDotHeader: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.400" : "grey.600"),
    animation: `${pulse} 2s ease-in-out infinite`,
  },
  roundTitle: {
    mb: 1,
  },
  roundDates: (isLive) => ({
    fontWeight: isLive ? 500 : 400,
  }),
  liveChip: {
    bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.700" : "grey.200"),
    color: (theme) => (theme.palette.mode === "dark" ? "grey.300" : "grey.700"),
    fontWeight: "medium",
    border: "none",
    mt: 2,
  },
  upcomingChip: {
    mt: 2,
    borderColor: "divider",
    color: "text.secondary",
    fontWeight: "normal",
  },
  noSessionsContainer: {
    textAlign: "center",
    py: 4,
  },
  noSessionsIcon: {
    fontSize: 48,
    color: "text.secondary",
    mb: 2,
  },
};

function CompetitionHome() {
  const competitionId = "cubuzzle2025";

  const liveSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (status) => {
    // Only scroll on large screens (sm breakpoint is 600px)
    if (window.innerWidth >= 600) {
      return;
    }

    const targetRef = status === "live" ? liveSectionRef : resultsSectionRef;
    const hashName = status === "live" ? "live-sessions" : "latest-results";

    try {
      navigate(`${location.pathname}#${hashName}`);
    } catch (e) {
      // fallback
      window.location.hash = hashName;
    }

    if (targetRef.current) {
      const el = targetRef.current;
      const APP_BAR_OFFSET = 64;
      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + window.pageYOffset;
      const target = Math.max(0, absoluteTop - APP_BAR_OFFSET - 8); // small padding
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  const {
    data: details,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["competition", competitionId, "details"],
    queryFn: async () => getCompetitionDetailsById(competitionId),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const finished = flatMap(details.competitionEvents, (competitionEvent) =>
    competitionEvent.rounds.filter((round) => round.finished).map((round) => [competitionEvent, round])
  );

  const live = flatMap(details.competitionEvents, (competitionEvent) =>
    competitionEvent.rounds.filter((round) => round.active && !round.finished).map((round) => [competitionEvent, round])
  );

  // Competition information
  const rounds = [
    { name: "Round 1", dates: "17-19 Oct", status: "live" },
    { name: "Semi-Finals", dates: "24-26 Oct", status: "upcoming" },
    { name: "Finals", dates: "31 Oct - 2 Nov", status: "upcoming" },
  ];

  return (
    <Container maxWidth="lg" sx={styles.container}>
      {/* Header */}
      <Box sx={styles.header}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cubuzzle Champion League - Season 2
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          October Challenge 2025 • Live Results & Rankings
        </Typography>
      </Box>

      {/* Current Round Status */}
      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
            <CalendarIcon />
            Tournament Progress
          </Typography>
          <Grid container spacing={2}>
            {rounds.map((round, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card
                  variant="outlined"
                  onClick={round.status === "live" || round.status === "completed" ? () => scrollToSection(round.status) : undefined}
                  sx={{
                    ...styles.roundCard,
                    bgcolor:
                      round.status === "live"
                        ? (theme) => (theme.palette.mode === "dark" ? "grey.900" : "grey.50")
                        : "background.paper",
                    borderColor:
                      round.status === "live"
                        ? (theme) => (theme.palette.mode === "dark" ? "grey.700" : "grey.300")
                        : "divider",
                    borderWidth: round.status === "live" ? 2 : 1,
                  }}
                >
                  <CardContent sx={styles.roundCardContent}>
                    {round.status === "live" && (
                      <>
                        <Box sx={styles.liveIndicatorTop} />
                        <Box sx={styles.liveIndicatorDot} />
                      </>
                    )}
                    <Typography variant="subtitle1" fontWeight="600" sx={styles.roundTitle}>
                      {round.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={styles.roundDates(round.status === "live")}>
                      {round.dates}
                    </Typography>
                    {round.status === "live" && <Chip label="● LIVE" size="small" sx={styles.liveChip} />}
                    {round.status === "upcoming" && (
                      <Chip label="Upcoming" size="small" variant="outlined" sx={styles.upcomingChip} />
                    )}
                    {round.status === "completed" && (
                      <Chip label="Completed" size="small" variant="outlined" sx={styles.upcomingChip} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Events */}
      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Events
          </Typography>
          <Grid container spacing={1}>
            <Grid item>
              <Chip label="2x2x2" variant="outlined" />
            </Grid>
            <Grid item>
              <Chip label="3x3x3" variant="outlined" />
            </Grid>
            <Grid item>
              <Chip label="Pyraminx" variant="outlined" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Competition Info */}
      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Competition Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Location
              </Typography>
              <Typography variant="body1">Cubuzzle Lounge, Dubai</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Participation
              </Typography>
              <Typography variant="body1">On-site & Online</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Live Sessions Section */}
      {live.length > 0 && (
        <Card sx={styles.card} ref={liveSectionRef} id="live-sessions">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
              <Box sx={styles.liveDotHeader} />
              Live Sessions
            </Typography>
            <Grid container spacing={2}>
              {live.map(([competitionEvent, round]) => (
                <Grid item key={`${round.id}-${competitionEvent.id}-live`} xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <Box />
                    <CardActionArea component={RouterLink} to={`/events/${competitionEvent.id}/rounds/${round.id}`}>
                      <CardHeader
                        avatar={<CubingIcon eventId={competitionEvent.id} />}
                        title={competitionEvent.name}
                        subheader={round.name}
                        titleTypographyProps={{ variant: "subtitle1" }}
                        subheaderTypographyProps={{ variant: "body2" }}
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {finished.length > 0 && (
        <Card sx={styles.card} ref={resultsSectionRef} id="latest-results">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
              <TrophyIcon />
              Latest Results
            </Typography>
            <Grid container spacing={2}>
              {finished.map(([competitionEvent, round]) => (
                <Grid item key={`${round.id}-${competitionEvent.id}`} xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardActionArea component={RouterLink} to={`/events/${competitionEvent.id}/rounds/${round.id}`}>
                      <CardHeader
                        avatar={<CubingIcon eventId={competitionEvent.id} />}
                        title={competitionEvent.name}
                        subheader={round.name}
                        titleTypographyProps={{ variant: "subtitle1" }}
                        subheaderTypographyProps={{ variant: "body2" }}
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* No Sessions/Results Message */}
      {live.length === 0 && finished.length === 0 && (
        <Card>
          <CardContent sx={styles.noSessionsContainer}>
            <TrophyIcon sx={styles.noSessionsIcon} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Active Sessions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back once the rounds begin for live sessions and results.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default CompetitionHome;
