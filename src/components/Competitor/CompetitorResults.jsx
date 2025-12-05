import { useState } from "react";
import { Grid, Typography, useMediaQuery } from "@mui/material";
import CompetitorResultsTable from "./CompetitorResultsTable";
import CompetitorResultDialog from "./CompetitorResultDialog";
import { getEventDisplayName } from "../../lib/competition";
import { getCompetitionDisplayName } from "../../lib/utils";

function CompetitorResults({ results }) {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const [selectedResult, setSelectedResult] = useState(null);

  const nonemptyResults = results.filter((result) => result.attempts?.length > 0);

  // Group by compId, then eventId
  const groupedByComp = (nonemptyResults || []).reduce((acc, r) => {
    const compId = r.compId || "unknown_comp";
    const eventId = r.eventId || "unknown_event";
    acc[compId] = acc[compId] || {};
    acc[compId][eventId] = acc[compId][eventId] || [];
    acc[compId][eventId].push(r);
    return acc;
  }, {});

  return (
    <>
      <Grid container direction="column" spacing={2}>
        {Object.keys(groupedByComp).map((compId) => (
          <Grid item key={compId}>
            <Typography variant="h6" gutterBottom>
              {getCompetitionDisplayName(compId)}
            </Typography>
            {Object.keys(groupedByComp[compId]).map((eventId) => (
              <Grid item key={eventId} sx={{ ml: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {getEventDisplayName(eventId, "long")}
                </Typography>
                <CompetitorResultsTable
                  eventId={eventId}
                  results={groupedByComp[compId][eventId]}
                  onResultClick={(result) => setSelectedResult(result)}
                />
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
      {!smScreen && (
        <CompetitorResultDialog
          eventId={selectedResult?.eventId}
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </>
  );
}

export default CompetitorResults;
