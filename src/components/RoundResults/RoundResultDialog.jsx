import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import { formatCellValue } from "../../lib/attempt-result";
import { orderedResultStats } from "../../lib/result";
import { withImageWidth } from "../../lib/utils";
import RecordTagBadge from "../RecordTagBadge/RecordTagBadge";
import ResultStat from "../ResultStat/ResultStat";

function RoundResultDialog({
  result,
  format,
  eventId,
  forecastView,
  advancementCondition,
  isDivisionBased = false,
  onClose,
}) {
  const stats = orderedResultStats(eventId, format, forecastView, advancementCondition);
  const imageUrlWithWidth = withImageWidth(result?.imageUrl, 100);

  return (
    <Dialog open={!!result} fullWidth={true} onClose={onClose}>
      {!!result && (
        <>
          <DialogTitle>
            {result.name} {result.ranking && `#${result.ranking}`}
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" spacing={2}>
              {imageUrlWithWidth && (
                <Grid item>
                  <Box display="flex" justifyContent="center">
                    <Avatar
                      src={imageUrlWithWidth}
                      alt={result.name}
                      sx={{ width: 80, height: 80, fontSize: "2rem" }}
                    />
                  </Box>
                </Grid>
              )}
              <Grid item>
                <Typography variant="subtitle2">Name</Typography>
                <Typography variant="body2">{result.name}</Typography>
              </Grid>

              <Grid item>
                <Typography variant="subtitle2">Category</Typography>
                <Typography variant="body2">{result.category}</Typography>
              </Grid>
              {isDivisionBased && (
                <Grid item>
                  <Typography variant="subtitle2">Division</Typography>
                  <Typography variant="body2">{result.calculatedDivision}</Typography>
                </Grid>
              )}
              {result.ranking && (
                <>
                  <Grid item>
                    <Typography variant="subtitle2">Attempts</Typography>
                    <Typography variant="body2">
                      {result.attempts.map((attempt) => formatCellValue(attempt.result, eventId)).join(", ")}
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
