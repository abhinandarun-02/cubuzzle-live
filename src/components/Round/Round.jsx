import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import ResultsProjector from "../ResultsProjector/ResultsProjector";
import RoundResults from "../RoundResults/RoundResults";
import RoundToolbar from "./RoundToolbar";
import { useQuery } from "@tanstack/react-query";
import { getRoundResults } from "../../lib/firebase/firestore";

function Round() {
  const competitionId = "cubuzzle2025";
  const { eventId, roundId } = useParams();

  const {
    data: round,
    isLoading,
    error,
  } = useQuery({
    queryKey: [competitionId, eventId, roundId, "results"],
    queryFn: async () => getRoundResults(competitionId, eventId, roundId),
  });

  if (isLoading) return <Loading />;

  if (error) return <Error error={error} />;

  return (
    <Grid container direction="column" spacing={1} sx={{ width: "100%", maxWidth: "100%" }}>
      <Grid item sx={{ width: "100%" }}>
        <RoundToolbar round={round} />
      </Grid>
      <Grid item sx={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
        <Routes>
          <Route
            path="projector"
            element={
              <ResultsProjector
                results={round.results}
                format={round.format}
                eventId={round.competitionEvent.id}
                title={`${round.competitionEvent.name} - ${round.name}`}
                exitUrl={`/events/${eventId}/rounds/${roundId}`}
                advancementCondition={round.advancementCondition}
                isDivisionBased={round.format?.divisionBased === true}
              />
            }
          />
          <Route
            path=""
            element={
              <RoundResults
                // We use key to reset component state on round change
                key={round.id}
                results={round.results}
                format={round.format}
                eventId={round.competitionEvent.id}
                advancementCondition={round.advancementCondition}
              />
            }
          />
          <Route path="*" element={<Navigate to={`/events/${eventId}/rounds/${roundId}`} />} />
        </Routes>
      </Grid>
    </Grid>
  );
}

export default Round;
