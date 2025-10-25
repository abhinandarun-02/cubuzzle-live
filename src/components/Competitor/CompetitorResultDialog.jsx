import { Link as RouterLink } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Link, Typography } from "@mui/material";
import { formatAttemptResult, formatCellValue } from "../../lib/attempt-result";
import { getEventDisplayName, getRoundDisplayName } from "../../lib/competition";

function is333(eventId) {
  return String(eventId) === "333";
}

function CompetitorResultDialog({ eventId, result, onClose }) {
  return (
    <Dialog open={!!result} fullWidth={true} onClose={onClose}>
      {!!result && (
        <>
          <DialogTitle>#{result.ranking}</DialogTitle>
          <DialogContent>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="subtitle2">Event</Typography>
                <Typography variant="body2">{getEventDisplayName(result.eventId)}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Round</Typography>
                <Typography variant="body2">{getRoundDisplayName(result.roundId)}</Typography>
                <Link component={RouterLink} to={`/events/${result.eventId}/rounds/${result.roundId}`} underline="hover">
                  All results
                </Link>
              </Grid>

              {is333(eventId) && (
                <Grid item>
                  <Typography variant="subtitle2">Division</Typography>
                  <Typography variant="body2">{result.calculatedDivision ?? "N/A"}</Typography>
                </Grid>
              )}

              {result.ranking !== 1000000 && (
                <>
                  <Grid item>
                    <Typography variant="subtitle2">Attempts</Typography>
                    <Typography variant="body2">
                      {result.attempts.map((attempt) => formatCellValue(attempt.result)).join(", ")}
                    </Typography>
                  </Grid>

                  <Grid item>
                    <Typography variant="subtitle2">Average</Typography>
                    <Typography variant="body2">{formatAttemptResult(result.average)}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle2">Best</Typography>
                    <Typography variant="body2">{formatAttemptResult(result.best)}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
        </>
      )}
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CompetitorResultDialog;
