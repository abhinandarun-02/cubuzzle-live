import { Link as RouterLink } from "react-router-dom";
import { Card, CardActionArea, CardHeader, Grid, Tooltip, Typography } from "@mui/material";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import Schedule from "../Schedule/Schedule";
import CubingIcon from "../CubingIcon/CubingIcon";
import { flatMap } from "../../lib/utils";
import { getTimezone } from "../../lib/date";
import { competitionHomeData } from "./data";

function CompetitionHome() {
  const { data } = competitionHomeData;

  const { competition } = data;
  const { competitionRecords } = competition;

  const active = flatMap(competition.competitionEvents, (competitionEvent) =>
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
              <Grid item key={round.id} xs={12} sm={6} lg={4}>
                <Card>
                  <CardActionArea component={RouterLink} to={`/competitions/${competition.id}/rounds/${round.id}`}>
                    <CardHeader
                      avatar={<CubingIcon eventId={competitionEvent.event.id} />}
                      title={`${competitionEvent.event.name} - ${round.name}`}
                    />
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}
      <Grid item sx={{ width: "100%" }}>
        <Grid container alignContent="center" sx={{ mb: 1 }}>
          <Grid item>
            <Typography variant="h5">Schedule</Typography>
          </Grid>
          <Grid item sx={{ flexGrow: 1 }} />
          <Grid item>
            <Tooltip
              title={`
              All the dates and times below are displayed in your local timezone: ${getTimezone()}
              `}
            >
              <NotificationImportantIcon color="action" />
            </Tooltip>
          </Grid>
        </Grid>
        <Schedule
          venues={competition.venues}
          competitionEvents={competition.competitionEvents}
          competitionId={competition.id}
        />
      </Grid>
      {competitionRecords.length > 0 && (
        <Grid item sx={{ width: "100%" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Records
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}

export default CompetitionHome;
