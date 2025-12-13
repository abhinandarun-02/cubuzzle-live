import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useRef } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  Chip,
  Container,
  Avatar,
  Divider,
  alpha,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  EmojiEvents as TrophyIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Timer as TimerIcon,
  ArrowForward as ArrowForwardIcon,
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Stars as StarsIcon,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import CubingIcon from "../CubingIcon/CubingIcon";
import { flatMap } from "../../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getCompetitionDetailsById } from "../../lib/firebase/firestore";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import { COMPETITION_ID } from "../../config";

// Define animations
const pulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.15); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.25), 0 0 30px rgba(255, 255, 255, 0.1); }
  100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.15); }
`;

const styles = {
  container: {
    py: { xs: 2, md: 4 },
  },
  heroSection: {
    position: "relative",
    textAlign: "center",
    mb: { xs: 3, md: 5 },
    py: { xs: 3, md: 5 },
    px: 3,
    borderRadius: 4,
    overflow: "hidden",
    background: (theme) =>
      theme.palette.mode === "dark"
        ? `linear-gradient(135deg, ${alpha(theme.palette.grey[800], 0.4)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 50%, ${alpha(theme.palette.grey[800], 0.3)} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.grey[200], 0.5)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 50%, ${alpha(theme.palette.grey[200], 0.4)} 100%)`,
    border: 1,
    borderColor: "divider",
    animation: `${fadeInUp} 0.6s ease-out`,
  },
  heroGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "120%",
    height: "120%",
    background: (theme) =>
      theme.palette.mode === "dark"
        ? `radial-gradient(circle, ${alpha(theme.palette.grey[700], 0.15)} 0%, transparent 70%)`
        : `radial-gradient(circle, ${alpha(theme.palette.grey[400], 0.1)} 0%, transparent 70%)`,
    pointerEvents: "none",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    mb: 3,
    position: "relative",
    zIndex: 1,
  },
  seasonBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    px: 2,
    py: 0.5,
    mb: 2,
    borderRadius: 5,
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? alpha(theme.palette.grey[700], 0.5) : alpha(theme.palette.grey[300], 0.5),
    color: "text.secondary",
    fontWeight: 600,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionCard: {
    mb: 3,
    borderRadius: 3,
    border: 1,
    borderColor: "divider",
    overflow: "hidden",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      borderColor: (theme) =>
        theme.palette.mode === "dark" ? alpha(theme.palette.grey[600], 0.5) : alpha(theme.palette.grey[400], 0.5),
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`
          : `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
    },
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1.5,
    p: 2.5,
    borderBottom: 1,
    borderColor: "divider",
    bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
  },
  sectionTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },
  sectionIcon: {
    p: 1,
    borderRadius: 2,
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? alpha(theme.palette.grey[700], 0.5) : alpha(theme.palette.grey[300], 0.5),
    color: "text.primary",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionContent: {
    p: 2.5,
  },
  roundCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 2.5,
    bgcolor: (theme) => (theme.palette.mode === "dark" ? alpha(theme.palette.grey[900], 0.6) : alpha(theme.palette.grey[50], 0.8)),
    borderColor: (theme) => (theme.palette.mode === "dark" ? "grey.800" : "grey.200"),
    borderWidth: 1,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? `0 12px 24px ${alpha(theme.palette.common.black, 0.4)}`
          : `0 12px 24px ${alpha(theme.palette.common.black, 0.12)}`,
      borderColor: (theme) =>
        theme.palette.mode === "dark" ? alpha(theme.palette.grey[500], 0.5) : alpha(theme.palette.grey[400], 0.5),
    },
  },
  roundCardLive: {
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.3) : alpha(theme.palette.grey[100], 0.9),
    borderColor: (theme) =>
      theme.palette.mode === "dark" ? alpha(theme.palette.grey[500], 0.6) : alpha(theme.palette.grey[400], 0.6),
    borderWidth: 2,
    animation: `${glowPulse} 3s ease-in-out infinite`,
  },
  roundCardContent: {
    textAlign: "center",
    py: 3,
    px: 2,
  },
  liveIndicatorTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: (theme) =>
      theme.palette.mode === "dark"
        ? `linear-gradient(90deg, ${theme.palette.grey[600]}, ${theme.palette.grey[400]}, ${theme.palette.grey[600]})`
        : `linear-gradient(90deg, ${theme.palette.grey[500]}, ${theme.palette.grey[300]}, ${theme.palette.grey[500]})`,
    backgroundSize: "200% 100%",
    animation: `${shimmer} 2s linear infinite`,
  },
  liveIndicatorDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: "50%",
    bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.400" : "grey.600",
    animation: `${pulse} 1.5s ease-in-out infinite`,
    boxShadow: (theme) =>
      theme.palette.mode === "dark" ? `0 0 8px ${theme.palette.grey[400]}` : `0 0 8px ${theme.palette.grey[600]}`,
  },
  liveDotHeader: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.400" : "grey.600",
    animation: `${pulse} 1.5s ease-in-out infinite`,
    boxShadow: (theme) =>
      theme.palette.mode === "dark" ? `0 0 8px ${theme.palette.grey[400]}` : `0 0 8px ${theme.palette.grey[600]}`,
  },
  liveChip: {
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? alpha(theme.palette.grey[700], 0.6) : alpha(theme.palette.grey[300], 0.6),
    color: "text.primary",
    fontWeight: 600,
    border: "none",
    mt: 2,
    "& .MuiChip-label": {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
    },
  },
  upcomingChip: {
    mt: 2,
    borderColor: "divider",
    color: "text.secondary",
    fontWeight: 500,
  },
  completedChip: {
    mt: 2,
    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
    color: "success.main",
    border: "none",
    fontWeight: 500,
  },
  eventChip: {
    px: 2,
    py: 2.5,
    borderRadius: 2,
    border: 1,
    borderColor: "divider",
    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
    transition: "all 0.2s ease",
    cursor: "default",
    "&:hover": {
      borderColor: (theme) =>
        theme.palette.mode === "dark" ? alpha(theme.palette.grey[500], 0.5) : alpha(theme.palette.grey[400], 0.5),
      bgcolor: (theme) =>
        theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.3) : alpha(theme.palette.grey[200], 0.3),
    },
  },
  infoCard: {
    p: 2.5,
    borderRadius: 2,
    bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
    border: 1,
    borderColor: "divider",
    height: "100%",
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 2,
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? alpha(theme.palette.grey[700], 0.5) : alpha(theme.palette.grey[300], 0.5),
    color: "text.primary",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mb: 1.5,
  },
  resultCard: {
    borderRadius: 2,
    overflow: "hidden",
    border: 1,
    borderColor: "divider",
    transition: "all 0.25s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      borderColor: (theme) =>
        theme.palette.mode === "dark" ? alpha(theme.palette.grey[500], 0.5) : alpha(theme.palette.grey[400], 0.5),
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? `0 8px 24px ${alpha(theme.palette.common.black, 0.3)}`
          : `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
    },
  },
  noSessionsContainer: {
    textAlign: "center",
    py: 6,
    px: 3,
  },
  noSessionsIcon: {
    fontSize: 64,
    color: (theme) => alpha(theme.palette.text.secondary, 0.3),
    mb: 2,
  },
  statsRow: {
    display: "flex",
    justifyContent: "center",
    gap: { xs: 2, md: 4 },
    mt: 3,
    flexWrap: "wrap",
  },
  statItem: {
    textAlign: "center",
    px: 2,
  },
};

function CompetitionHome() {
  const competitionId = COMPETITION_ID;

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
    { name: "Round 1", dates: "12-13 Dec", status: "live" },
    { name: "Finals", dates: "14 Dec", status: "upcoming" },
  ];

  // Events data
  const events = [
    { id: "333", name: "3x3x3", icon: "333" },
    { id: "444", name: "4x4x4", icon: "444" },
    { id: "skewb", name: "Skewb", icon: "skewb" },
  ];


  return (
    <Container maxWidth="lg" sx={styles.container}>
      {/* Hero Section */}
      <Box sx={styles.heroSection}>
        <Box sx={styles.heroGlow} />
        <Box sx={styles.logoContainer}>
          <img
            src="/ccl-logo.png"
            alt="Cubuzzle Champion League"
            style={{
              height: "auto",
              width: "100%",
              maxWidth: "200px",
              display: "block",
              filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
            }}
          />
        </Box>

        <Box sx={styles.seasonBadge}>
          <StarsIcon sx={{ fontSize: 14 }} />
          Season 3 • 2025
        </Box>

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            letterSpacing: -0.5,
            position: "relative",
            zIndex: 1,
          }}
        >
          Cubuzzle Champion League
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            fontWeight: 400,
            maxWidth: 500,
            mx: "auto",
            position: "relative",
            zIndex: 1,
            lineHeight: 1.6,
          }}
        >
          The Ultimate Speedcubing Showdown
        </Typography>


      </Box>

      {/* Tournament Progress */}
      <Card sx={styles.sectionCard}>
        <Box sx={styles.sectionHeader}>
          <Box sx={styles.sectionTitleGroup}>
            <Box sx={styles.sectionIcon}>
              <CalendarIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Tournament Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track the competition rounds
              </Typography>
            </Box>
          </Box>
          {live.length > 0 && (
            <Chip
              icon={<Box sx={styles.liveDotHeader} />}
              label="Live Now"
              size="small"
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? alpha(theme.palette.grey[700], 0.6) : alpha(theme.palette.grey[300], 0.6),
                color: "text.primary",
                fontWeight: 600,
                "& .MuiChip-icon": { ml: 1 },
              }}
            />
          )}
        </Box>
        <Box sx={styles.sectionContent}>
          <Grid container spacing={2}>
            {rounds.map((round, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card
                  variant="outlined"
                  onClick={
                    round.status === "live" || round.status === "completed"
                      ? () => scrollToSection(round.status)
                      : undefined
                  }
                  sx={{
                    ...styles.roundCard,
                    ...(round.status === "live" && styles.roundCardLive),
                  }}
                >
                  <CardContent sx={styles.roundCardContent}>
                    {round.status === "live" && (
                      <>
                        <Box sx={styles.liveIndicatorTop} />
                        <Box sx={styles.liveIndicatorDot} />
                      </>
                    )}
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {round.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}
                    >
                      <ScheduleIcon sx={{ fontSize: 16 }} />
                      {round.dates}
                    </Typography>
                    {round.status === "live" && (
                      <Chip
                        icon={<PlayIcon sx={{ fontSize: 16 }} />}
                        label="LIVE"
                        size="small"
                        sx={styles.liveChip}
                      />
                    )}
                    {round.status === "upcoming" && (
                      <Chip
                        icon={<TimerIcon sx={{ fontSize: 16 }} />}
                        label="Upcoming"
                        size="small"
                        variant="outlined"
                        sx={styles.upcomingChip}
                      />
                    )}
                    {round.status === "completed" && (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                        label="Completed"
                        size="small"
                        sx={styles.completedChip}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>

      {/* Events Section */}
      <Card sx={styles.sectionCard}>
        <Box sx={styles.sectionHeader}>
          <Box sx={styles.sectionTitleGroup}>
            <Box sx={styles.sectionIcon}>
              <TrophyIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Events
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compete in these categories
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={styles.sectionContent}>
          <Grid container spacing={2}>
            {events.map((event) => (
              <Grid item xs={6} sm={4} key={event.id}>
                <Box sx={styles.eventChip}>
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                    <CubingIcon eventId={event.id} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {event.name}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>

      {/* Competition Details */}
      <Card sx={styles.sectionCard}>
        <Box sx={styles.sectionHeader}>
          <Box sx={styles.sectionTitleGroup}>
            <Box sx={styles.sectionIcon}>
              <LocationIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Competition Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Everything you need to know
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={styles.sectionContent}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={styles.infoCard}>
                <Box sx={styles.infoIconBox}>
                  <LocationIcon />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                  Location
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Cubuzzle Lounge
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dubai, UAE
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={styles.infoCard}>
                <Box sx={styles.infoIconBox}>
                  <PeopleIcon />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                  Participation
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Hybrid Format
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  On-site & Online
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={styles.infoCard}>
                <Box sx={styles.infoIconBox}>
                  <CalendarIcon />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                  Duration
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  December 12-14
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  3 Days of Action
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Live Sessions Section */}
      {live.length > 0 && (
        <Card sx={styles.sectionCard} ref={liveSectionRef} id="live-sessions">
          <Box sx={styles.sectionHeader}>
            <Box sx={styles.sectionTitleGroup}>
              <Box
                sx={{
                  ...styles.sectionIcon,
                  position: "relative",
                }}
              >
                <PlayIcon />
                <Box
                  sx={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.400" : "grey.600",
                    animation: `${pulse} 1.5s ease-in-out infinite`,
                  }}
                />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Live Sessions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Happening right now
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${live.length} Active`}
              size="small"
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? alpha(theme.palette.grey[700], 0.6) : alpha(theme.palette.grey[300], 0.6),
                color: "text.primary",
                fontWeight: 600,
              }}
            />
          </Box>
          <Box sx={styles.sectionContent}>
            <Grid container spacing={2}>
              {live.map(([competitionEvent, round]) => (
                <Grid item key={`${round.id}-${competitionEvent.id}-live`} xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={styles.resultCard}>
                    <CardActionArea component={RouterLink} to={`/events/${competitionEvent.id}/rounds/${round.id}`}>
                      <CardHeader
                        avatar={
                          <Avatar
                            sx={{
                              bgcolor: (theme) =>
                                theme.palette.mode === "dark" ? alpha(theme.palette.grey[700], 0.6) : alpha(theme.palette.grey[300], 0.6),
                              color: "text.primary",
                            }}
                          >
                            <CubingIcon eventId={competitionEvent.id} />
                          </Avatar>
                        }
                        title={competitionEvent.name}
                        subheader={round.name}
                        titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }}
                        subheaderTypographyProps={{ variant: "body2" }}
                        action={
                          <Tooltip title="View Results">
                            <IconButton size="small">
                              <ArrowForwardIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Card>
      )}

      {/* Results Section */}
      {finished.length > 0 && (
        <Card sx={styles.sectionCard} ref={resultsSectionRef} id="latest-results">
          <Box sx={styles.sectionHeader}>
            <Box sx={styles.sectionTitleGroup}>
              <Box sx={styles.sectionIcon}>
                <TrophyIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Latest Results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed rounds and rankings
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${finished.length} Completed`}
              size="small"
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? alpha(theme.palette.grey[700], 0.6) : alpha(theme.palette.grey[300], 0.6),
                color: "text.primary",
                fontWeight: 600,
              }}
            />
          </Box>
          <Box sx={styles.sectionContent}>
            <Grid container spacing={2}>
              {finished.map(([competitionEvent, round]) => (
                <Grid item key={`${round.id}-${competitionEvent.id}`} xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={styles.resultCard}>
                    <CardActionArea component={RouterLink} to={`/events/${competitionEvent.id}/rounds/${round.id}`}>
                      <CardHeader
                        avatar={
                          <Avatar
                            sx={{
                              bgcolor: (theme) =>
                                theme.palette.mode === "dark" ? alpha(theme.palette.grey[700], 0.6) : alpha(theme.palette.grey[300], 0.6),
                              color: "text.primary",
                            }}
                          >
                            <CubingIcon eventId={competitionEvent.id} />
                          </Avatar>
                        }
                        title={competitionEvent.name}
                        subheader={round.name}
                        titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }}
                        subheaderTypographyProps={{ variant: "body2" }}
                        action={
                          <Tooltip title="View Results">
                            <IconButton size="small">
                              <ArrowForwardIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                    </CardActionArea>
                    <Divider />
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.3) : alpha(theme.palette.grey[200], 0.3),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        <CheckCircleIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
                        Results Available
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Card>
      )}

      {/* No Sessions/Results Message */}
      {live.length === 0 && finished.length === 0 && (
        <Card sx={styles.sectionCard}>
          <CardContent sx={styles.noSessionsContainer}>
            <TrophyIcon sx={styles.noSessionsIcon} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              No Active Sessions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
              Check back once the rounds begin for live sessions and results. The excitement is about to begin!
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default CompetitionHome;
