import { Link as RouterLink } from "react-router-dom";
import { Card, CardActionArea, CardHeader, Grid, Typography } from "@mui/material";
import CubingIcon from "../CubingIcon/CubingIcon";
import { flatMap } from "../../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getCompetitionDetailsById } from "../../lib/firebase/firestore";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";

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

  const active = flatMap(details.competitionEvents, (competitionEvent) =>
    competitionEvent.rounds.filter((round) => round.active).map((round) => [competitionEvent, round])
  );

  return (
    <Grid container direction="column" spacing={4}>
      {active.length > 0 && (
        <Grid item sx={{ width: "100%" }}>
          <Typography variant="h5" gutterBottom>
            Active rounds
          </Typography>
          <Grid container spacing={1}>
            {active.map(([competitionEvent, round]) => (
              <Grid item key={`${round.id}-${round.competitionEvent.id}`} xs={12} sm={6} lg={4}>
                <Card>
                  <CardActionArea
                    component={RouterLink}
                    to={`/events/${competitionEvent.id}/rounds/${round.id}`}
                  >
                    <CardHeader
                      avatar={<CubingIcon eventId={competitionEvent.id} />}
                      title={`${competitionEvent.name} - ${round.name}`}
                    />
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}
      <Grid item sx={{ width: "100%" }}>
        {/* <Grid container alignContent="center" sx={{ mb: 1 }}>
          <Grid item>
            <Typography variant="h5">Schedule</Typography>
          </Grid>
          <Grid item sx={{ flexGrow: 1 }} />
        </Grid> */}
        {/* <Schedule
          venues={competition.venues}
          competitionEvents={competition.competitionEvents}
          competitionId={competition.id}
        /> */}
      </Grid>
    </Grid>
  );
}

export default CompetitionHome;
