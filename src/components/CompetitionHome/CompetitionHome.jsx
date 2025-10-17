import { Link as RouterLink } from "react-router-dom";
import { 
  Card, 
  CardActionArea, 
  CardContent,
  CardHeader, 
  Grid, 
  Typography, 
  Box, 
  Chip, 
  Container
} from "@mui/material";
import { 
  CalendarToday as CalendarIcon,
  EmojiEvents as TrophyIcon
} from "@mui/icons-material";
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

function CompetitionHome() {
  const competitionId = "cubuzzle2025";

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

  // Competition information
  const rounds = [
    { name: "Round 1", dates: "17-19 Oct", status: "live" },
    { name: "Semi-Finals", dates: "24-26 Oct", status: "upcoming" },
    { name: "Finals", dates: "31 Oct - 2 Nov", status: "upcoming" }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cubuzzle Champion League - Season 2
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          October Challenge 2025 • Live Results & Rankings
        </Typography>
      </Box>

      {/* Current Round Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon />
            Tournament Progress
          </Typography>
          <Grid container spacing={2}>
            {rounds.map((round, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card
                  variant="outlined"
                  sx={{ 
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: round.status === 'live' 
                      ? (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'
                      : 'background.paper',
                    borderColor: round.status === 'live' 
                      ? (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300'
                      : 'divider',
                    borderWidth: round.status === 'live' ? 2 : 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: round.status === 'live'
                        ? (theme) => theme.palette.mode === 'dark' 
                          ? '0 4px 12px rgba(255, 255, 255, 0.1)'
                          : '0 4px 12px rgba(0, 0, 0, 0.1)'
                        : 2
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {round.status === 'live' && (
                      <>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.400' : 'grey.600',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.400' : 'grey.600',
                            animation: `${pulse} 2s ease-in-out infinite`,
                          }}
                        />
                      </>
                    )}
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                      {round.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontWeight: round.status === 'live' ? 500 : 400
                      }}
                    >
                      {round.dates}
                    </Typography>
                    {round.status === 'live' && (
                      <Chip 
                        label="● LIVE" 
                        size="small" 
                        sx={{ 
                          mt: 2, 
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
                          color: (theme) => theme.palette.mode === 'dark' ? 'grey.300' : 'grey.700',
                          fontWeight: 'medium',
                          border: 'none'
                        }} 
                      />
                    )}
                    {round.status === 'upcoming' && (
                      <Chip 
                        label="Upcoming" 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          mt: 2,
                          borderColor: 'divider',
                          color: 'text.secondary',
                          fontWeight: 'normal'
                        }} 
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Events */}
      <Card sx={{ mb: 3 }}>
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
              <Chip label="Wildcard Event" variant="outlined" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Competition Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Competition Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Location
              </Typography>
              <Typography variant="body1">
                Cubuzzle Lounge, Dubai
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Participation
              </Typography>
              <Typography variant="body1">
                On-site & Online
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Section */}
      {finished.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon />
              Latest Results
            </Typography>
            <Grid container spacing={2}>
              {finished.map(([competitionEvent, round]) => (
                <Grid item key={`${round.id}-${round.competitionEvent.id}`} xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardActionArea
                      component={RouterLink}
                      to={`/events/${competitionEvent.id}/rounds/${round.id}`}
                    >
                      <CardHeader
                        avatar={<CubingIcon eventId={competitionEvent.id} />}
                        title={competitionEvent.name}
                        subheader={round.name}
                        titleTypographyProps={{ variant: 'subtitle1' }}
                        subheaderTypographyProps={{ variant: 'body2' }}
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {finished.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <TrophyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Results Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back once the rounds begin for live results and rankings.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default CompetitionHome;
