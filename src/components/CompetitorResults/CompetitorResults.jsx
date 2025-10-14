import { useState } from "react";
import { Grid, Typography, useMediaQuery } from "@mui/material";
import CompetitorResultsTable from "./CompetitorResultsTable";
import CompetitorResultDialog from "./CompetitorResultDialog";
import { groupBy, orderBy } from "../../lib/utils";

function CompetitorResults({ results }) {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const [selectedResult, setSelectedResult] = useState(null);

  const nonemptyResults = results.filter(
    (result) => result.attempts.length > 0,
  );
  const resultsByEventName = groupBy(
    orderBy(nonemptyResults, [
      (result) => result.round.competitionEvent.rank,
      (result) => result.round.number,
    ]),
    (result) => result.round.competitionEvent.name,
  );

  return (
    <>
      <Grid container direction="column" spacing={2}>
        {Object.entries(resultsByEventName).map(([eventName, results]) => (
          <Grid item key={eventName}>
            <Typography variant="subtitle1" gutterBottom>
              {eventName}
            </Typography>
            <CompetitorResultsTable
              results={results}
              onResultClick={(result) => setSelectedResult(result)}
            />
          </Grid>
        ))}
      </Grid>
      {!smScreen && (
        <CompetitorResultDialog
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </>
  );
}

export default CompetitorResults;
