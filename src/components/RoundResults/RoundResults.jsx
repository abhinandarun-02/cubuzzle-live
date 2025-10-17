import { useState, useCallback, useMemo } from "react";
import { Button, Grid, useMediaQuery, Typography, Box } from "@mui/material";
import RoundResultsTable from "./RoundResultsTable";
import RoundResultDialog from "./RoundResultDialog";
import { resultsForView } from "../../lib/result";
import { splitResultsByDivision } from "../../lib/utils";

const DEFAULT_VISIBLE_RESULTS = 100;

function RoundResults({
  results,
  format,
  eventId,
  forecastView,
  advancementCondition,
}) {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const [selectedResult, setSelectedResult] = useState(null);
  const [showAll, setShowAll] = useState(
    results.length <= DEFAULT_VISIBLE_RESULTS,
  );

  const handleResultClick = useCallback((result) => {
    setSelectedResult(result);
  }, []);

  const viewResults = useMemo(
    () =>
      resultsForView(
        results,
        eventId,
        format,
        forecastView,
        advancementCondition,
      ),
    [results, eventId, format, forecastView, advancementCondition],
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
      return [{
        name: "All",
        results: scoredResults
      }];
    }
  }, [scoredResults, isDivisionBased]);

  const totalResultsCount = useMemo(() => {
    return divisionResults.reduce((total, division) => total + division.results.length, 0);
  }, [divisionResults]);

  const visibleDivisionResults = useMemo(() => {
    if (showAll) {
      return divisionResults;
    } else {
      let currentCount = 0;
      const visibleDivisions = [];
      
      for (const division of divisionResults) {
        const remainingLimit = DEFAULT_VISIBLE_RESULTS - currentCount;
        if (remainingLimit <= 0) break;
        
        const visibleResults = division.results.slice(0, remainingLimit);
        visibleDivisions.push({
          ...division,
          results: visibleResults
        });
        currentCount += visibleResults.length;
        
        if (currentCount >= DEFAULT_VISIBLE_RESULTS) break;
      }
      
      return visibleDivisions;
    }
  }, [divisionResults, showAll]);

  return (
    <>
      <Grid container direction="column" alignItems="center" spacing={2}>
        {visibleDivisionResults.map((division) => (
          <Grid item key={division.name} style={{ width: "100%" }}>
            {isDivisionBased && divisionResults.length > 1 && division.name !== "All" && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" component="h3" >
                  Division {division.name}
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
        ))}
        {!showAll && totalResultsCount > DEFAULT_VISIBLE_RESULTS && (
          <Grid item>
            <Button
              variant="contained"
              disableElevation
              size="small"
              onClick={() => setShowAll(true)}
            >
              {totalResultsCount - DEFAULT_VISIBLE_RESULTS} more
            </Button>
          </Grid>
        )}
      </Grid>
      {!smScreen && (
        <RoundResultDialog
          result={selectedResult}
          format={format}
          eventId={eventId}
          forecastView={forecastView}
          advancementCondition={advancementCondition}
          isDivisionBased={isDivisionBased}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </>
  );
}

export default RoundResults;
