import { useState } from "react";
import { Grid, Typography, useMediaQuery } from "@mui/material";
import CompetitorResultsTable from "./CompetitorResultsTable";
import CompetitorResultDialog from "./CompetitorResultDialog";
import { getEventDisplayName } from "../../lib/competition";

function CompetitorResults({ results }) {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const [selectedResult, setSelectedResult] = useState(null);

  const nonemptyResults = results.filter((result) => result.attempts?.length > 0);

  const grouped = (nonemptyResults || []).reduce((acc, r) => {
    const key = r.eventId || "unknown";
    acc[key] = acc[key] || [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <>
      <Grid container direction="column" spacing={2}>
        {Object.keys(grouped).map((eventId) => (
          <Grid item key={eventId}>
            <Typography variant="subtitle1" gutterBottom>
              {getEventDisplayName(eventId, "long")}
            </Typography>
            <CompetitorResultsTable results={grouped[eventId]} onResultClick={(result) => setSelectedResult(result)} />
          </Grid>
        ))}
      </Grid>
      {!smScreen && <CompetitorResultDialog result={selectedResult} onClose={() => setSelectedResult(null)} />}
    </>
  );
}

export default CompetitorResults;
