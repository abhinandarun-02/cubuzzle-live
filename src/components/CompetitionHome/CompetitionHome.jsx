import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  Leaderboard as LeaderboardIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useQuery } from "@tanstack/react-query";

import CubingIcon from "../CubingIcon/CubingIcon";
import Error from "../Error/Error";
import Loading from "../Loading/Loading";
import { getCompetitionDetailsById } from "../../lib/firebase/firestore";
import { flatMap } from "../../lib/utils";

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
  logoWrap: {
    display: "flex",
    justifyContent: "center",
    mb: 3,
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
    height: "100%",
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? "grey.900" : "grey.50",
    borderColor: (theme) =>
      theme.palette.mode === "dark" ? "grey.700" : "grey.300",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 4px 12px rgba(255, 255, 255, 0.1)"
          : "0 4px 12px rgba(0, 0, 0, 0.1)",
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
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? "grey.400" : "grey.600",
  },
  liveIndicatorDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: "50%",
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? "grey.400" : "grey.600",
    animation: `${pulse} 2s ease-in-out infinite`,
  },
  liveDotHeader: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? "grey.400" : "grey.600",
    animation: `${pulse} 2s ease-in-out infinite`,
  },
  liveChip: {
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? "grey.700" : "grey.200",
    color: (theme) => (theme.palette.mode === "dark" ? "grey.300" : "grey.700"),
    fontWeight: "medium",
    border: "none",
    mt: 2,
  },
  statusChip: {
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
  leaderboardCard: {
    height: "100%",
    borderColor: "divider",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 4px 12px rgba(255, 255, 255, 0.08)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
  },
  leaderboardAction: {
    height: "100%",
  },
  leaderboardContent: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  leaderboardIconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 44,
    height: 44,
    borderRadius: "50%",
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? "grey.800" : "grey.100",
  },
};

const events = ["3x3x3", "3x3x3 One-Handed", "Megaminx"];

function CompetitionHome() {
  const competitionId = "cubuzzle-s4";

  const liveSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (status) => {
    if (window.innerWidth >= 600) {
      return;
    }

    const targetRef = status === "live" ? liveSectionRef : resultsSectionRef;
    const hashName = status === "live" ? "live-sessions" : "latest-results";

    try {
      navigate(`${location.pathname}#${hashName}`);
    } catch (e) {
      window.location.hash = hashName;
    }

    if (targetRef.current) {
      const el = targetRef.current;
      const appBarOffset = 64;
      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + window.pageYOffset;
      const target = Math.max(0, absoluteTop - appBarOffset - 8);
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
    competitionEvent.rounds
      .filter((round) => round.finished)
      .map((round) => [competitionEvent, round]),
  );

  const live = flatMap(details.competitionEvents, (competitionEvent) =>
    competitionEvent.rounds
      .filter((round) => round.active && !round.finished)
      .map((round) => [competitionEvent, round]),
  );

  const rounds = [
    { name: "Qualifier 1", dates: "May 2026", status: "live" },
    {
      name: "Qualifier 2",
      dates: "June 2026",
      status: "upcoming",
    },
    { name: "Grand Finale", dates: "July 2026", status: "upcoming" },
  ];

  return (
    <Container maxWidth="lg" sx={styles.container}>
      <Box sx={styles.header}>
        <Box sx={styles.logoWrap}>
          <img
            src="/ccl-logo.png"
            alt="Cubuzzle Champion League"
            style={{
              height: "auto",
              width: "100%",
              maxWidth: "180px",
              display: "block",
            }}
          />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Cubuzzle Champion League - Season 4
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Summer Championship 2026 • The Ultimate Speedcubing Battle
        </Typography>
      </Box>

      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
            <CalendarIcon />
            Tournament Progress
          </Typography>
          <Grid container spacing={2}>
            {rounds.map((round) => (
              <Grid item xs={12} sm={4} key={round.name}>
                <Card
                  variant="outlined"
                  onClick={
                    round.status === "live" || round.status === "completed"
                      ? () => scrollToSection(round.status)
                      : undefined
                  }
                  sx={{
                    ...styles.roundCard,
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
                    <Typography
                      variant="subtitle1"
                      fontWeight="600"
                      gutterBottom
                    >
                      {round.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {round.dates}
                    </Typography>
                    {round.status === "live" && (
                      <Chip label="Live" size="small" sx={styles.liveChip} />
                    )}
                    {round.status === "upcoming" && (
                      <Chip
                        label="Upcoming"
                        size="small"
                        variant="outlined"
                        sx={styles.statusChip}
                      />
                    )}
                    {round.status === "completed" && (
                      <Chip
                        label="Completed"
                        size="small"
                        variant="outlined"
                        sx={styles.statusChip}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
            <LeaderboardIcon />
            Event Leaderboards
          </Typography>
          <Grid container spacing={2}>
            {details.competitionEvents.map((competitionEvent) => (
              <Grid item xs={12} sm={6} md={4} key={competitionEvent.id}>
                <Card variant="outlined" sx={styles.leaderboardCard}>
                  <CardActionArea
                    component={RouterLink}
                    to={`/events/${competitionEvent.id}/leaderboard`}
                    sx={styles.leaderboardAction}
                  >
                    <CardContent sx={styles.leaderboardContent}>
                      <Box sx={styles.leaderboardIconWrap}>
                        <CubingIcon eventId={competitionEvent.id} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight="600" noWrap>
                          {competitionEvent.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          View leaderboard
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Competition Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <CalendarIcon color="action" />
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Dates
                  </Typography>
                  <Typography variant="body1">May - July 2026</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <PublicIcon color="action" />
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Format
                  </Typography>
                  <Typography variant="body1">
                    Online global competition
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <GroupsIcon color="action" />
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Qualifier
                  </Typography>
                  <Typography variant="body1">Ao3 → Ao6 → Ao9</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <TrophyIcon color="action" />
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Finale
                  </Typography>
                  <Typography variant="body1">
                    Grand finale championship
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {live.length > 0 && (
        <Card sx={styles.card} ref={liveSectionRef} id="live-sessions">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
              <Box sx={styles.liveDotHeader} />
              Live Sessions
            </Typography>
            <Grid container spacing={2}>
              {live.map(([competitionEvent, round]) => (
                <Grid
                  item
                  key={`${round.id}-${competitionEvent.id}-live`}
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <Card variant="outlined">
                    <CardActionArea
                      component={RouterLink}
                      to={`/events/${competitionEvent.id}/rounds/${round.id}`}
                    >
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

      {finished.length > 0 && (
        <Card sx={styles.card} ref={resultsSectionRef} id="latest-results">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
              <TrophyIcon />
              Latest Results
            </Typography>
            <Grid container spacing={2}>
              {finished.map(([competitionEvent, round]) => (
                <Grid
                  item
                  key={`${round.id}-${competitionEvent.id}`}
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <Card variant="outlined">
                    <CardActionArea
                      component={RouterLink}
                      to={`/events/${competitionEvent.id}/rounds/${round.id}`}
                    >
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
