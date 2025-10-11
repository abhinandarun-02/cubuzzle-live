import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import ResultsProjector from "../ResultsProjector/ResultsProjector";
import RoundResults from "../RoundResults/RoundResults";
import RoundToolbar from "./RoundToolbar";
import { roundData } from "./data";

function Round() {
  const { competitionId, roundId } = useParams();

  const { data, loading, error } = roundData;

  if (!data) return <Loading />;
  if (error) return <Error error={error} />;
  const { round } = data;

  return (
    <>
      {loading && <Loading />}
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <RoundToolbar
            round={round}
            competitionId={competitionId}
           
          />
        </Grid>
        <Grid item>
          <Routes>
            <Route
              path="projector"
              element={
                <ResultsProjector
                  results={round.results}
                  format={round.format}
                  eventId={round.competitionEvent.event.id}
                  title={`${round.competitionEvent.event.name} - ${round.name}`}
                  exitUrl={`/competitions/${competitionId}/rounds/${roundId}`}
                  advancementCondition={round.advancementCondition}
                />
              }
            />
            <Route
              path=""
              element={
                <RoundResults
                  // We use key to reset component state on round change
                  key={data.round.id}
                  results={round.results}
                  format={round.format}
                  eventId={round.competitionEvent.event.id}
                  competitionId={competitionId}
                  advancementCondition={round.advancementCondition}
                />
              }
            />
            <Route path="*" element={<Navigate to={`/competitions/${competitionId}/rounds/${roundId}`} />} />
          </Routes>
        </Grid>
      </Grid>
    </>
  );
}

export default Round;
