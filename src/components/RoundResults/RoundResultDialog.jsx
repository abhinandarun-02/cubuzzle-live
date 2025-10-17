import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material";
import { formatAttemptResult } from "../../lib/attempt-result";
import { orderedResultStats } from "../../lib/result";
import RecordTagBadge from "../RecordTagBadge/RecordTagBadge";
import ResultStat from "../ResultStat/ResultStat";

function RoundResultDialog({ result, format, eventId, forecastView, advancementCondition, isDivisionBased = false, onClose }) {
  const stats = orderedResultStats(eventId, format, forecastView, advancementCondition);

  return (
    <Dialog open={!!result} fullWidth={true} onClose={onClose}>
      {!!result && (
        <>
          <DialogTitle>
            {result.name} {result.ranking && `#${result.ranking}`}
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="subtitle2">Name</Typography>
                <Typography variant="body2">{result.name}</Typography>
              </Grid>

              <Grid item>
                <Typography variant="subtitle2">Division</Typography>
                <Typography variant="body2">{result.division}</Typography>
              </Grid>
              {isDivisionBased && (
                <Grid item>
                  <Typography variant="subtitle2">Category</Typography>
                  <Typography variant="body2">{result.category}</Typography>
                </Grid>
              )}
              {result.ranking && (
                <>
                  <Grid item>
                    <Typography variant="subtitle2">Attempts</Typography>
                    <Typography variant="body2">
                      {result.attempts.map((attempt) => formatAttemptResult(attempt.result, eventId)).join(", ")}
                    </Typography>
                  </Grid>
                  {stats.map(({ name, field, recordTagField }) => (
                    <Grid item key={name}>
                      <Typography variant="subtitle2">{name}</Typography>
                      <Typography variant="body2">
                        <RecordTagBadge recordTag={result[recordTagField]}>
                          <ResultStat result={result} field={field} eventId={eventId} forecastView={forecastView} />
                        </RecordTagBadge>
                      </Typography>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export default RoundResultDialog;
