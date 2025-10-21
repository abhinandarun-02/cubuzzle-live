import { useState, useCallback, useMemo } from "react";
import { Grid, Typography, Box } from "@mui/material";
import RoundResultsTable from "./RoundResultsTable";
import RoundResultDialog from "./RoundResultDialog";
import { resultsForView } from "../../lib/result";
import { splitResultsByDivision } from "../../lib/utils";

function RoundResults({ results, format, eventId, forecastView, advancementCondition }) {
  const [selectedResult, setSelectedResult] = useState(null);

  const handleResultClick = useCallback((result) => {
    setSelectedResult(result);
  }, []);

  const viewResults = useMemo(
    () => resultsForView(results, eventId, format, forecastView, advancementCondition),
    [results, eventId, format, forecastView, advancementCondition]
  );

  // Filter to only show scored results
  const scoredResults = useMemo(() => {
    return viewResults.filter((result) => result.scored);
  }, [viewResults]);

  // Check if we should show results by division or together
  const isDivisionBased = format?.divisionBased === true;

  const divisionResults = useMemo(() => {
    if (isDivisionBased) {
      return splitResultsByDivision(scoredResults);
    } else {
      // Show all results together in a single group
      return [
        {
          name: "All",
          results: scoredResults,
        },
      ];
    }
  }, [scoredResults, isDivisionBased]);

  return (
    <>
      <Grid container direction="column" alignItems="center" spacing={2}>
        {divisionResults.map((division) => {
          const divisionIsUnknown = division.name === "Unknown";
          const divisionLabel = divisionIsUnknown ? "DNF/DNS" : `Division ${division.name}`;
          const timeLabel = !divisionIsUnknown && division.time ? ` (${division.time})` : "";
          return (
            <Grid item key={division.name} style={{ width: "100%" }}>
              {isDivisionBased && divisionResults.length > 1 && division.name !== "All" && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    {divisionLabel}
                    <Typography variant="subtitle1" color="textSecondary" component="span">
                      {timeLabel}
                    </Typography>
                  </Typography>
                </Box>
              )}
              <RoundResultsTable
                results={division.results}
                format={format}
                eventId={eventId}
                onResultClick={handleResultClick}
                forecastView={forecastView}
                advancementCondition={advancementCondition}
                isDivisionBased={isDivisionBased}
              />
            </Grid>
          );
        })}
      </Grid>

      <RoundResultDialog
        result={selectedResult}
        format={format}
        eventId={eventId}
        forecastView={forecastView}
        advancementCondition={advancementCondition}
        isDivisionBased={isDivisionBased}
        onClose={() => setSelectedResult(null)}
      />
    </>
  );
}

export default RoundResults;
