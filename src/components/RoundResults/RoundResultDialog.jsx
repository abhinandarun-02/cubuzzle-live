import { Link as RouterLink } from "react-router-dom";
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
  Link,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { green, red } from "@mui/material/colors";
import { formatAttemptResult, formatCellValue } from "../../lib/attempt-result";
import { orderedResultStats } from "../../lib/result";
import { withImageWidth } from "../../lib/utils";
import RecordTagBadge from "../RecordTagBadge/RecordTagBadge";
import ResultStat from "../ResultStat/ResultStat";
import FlagIcon from "../FlagIcon/FlagIcon";

const renderDivisionChangeIcon = (divisionChange) => {
  if (!divisionChange?.status) return null;
  if (divisionChange.status === "promoted") {
    return (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: green[600],
          ml: 0.5,
        }}
        title={`Promoted from ${divisionChange.from} to ${divisionChange.to}`}
      >
        <ArrowUpward
          sx={{
            fontSize: "0.875rem",
            color: "white",
          }}
        />
      </Box>
    );
  }
  if (divisionChange.status === "demoted") {
    return (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: red[600],
          ml: 0.5,
        }}
        title={`Demoted from ${divisionChange.from} to ${divisionChange.to}`}
      >
        <ArrowDownward
          sx={{
            fontSize: "0.875rem",
            color: "white",
          }}
        />
      </Box>
    );
  }
  return null;
};

function resultScore(result) {
  return result?.cumulativeScore ?? result?.score;
}

function formatScore(result, eventId) {
  const score = resultScore(result);
  if (typeof score !== "number") return "-";
  if (score === 0) return "-";
  return formatAttemptResult(score, eventId);
}

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
  const hasScore = typeof resultScore(result) === "number";

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
                <Typography variant="subtitle2">ID</Typography>
                <Typography variant="body2">{result.id}</Typography>
              </Grid>

              <Grid item>
                <Typography variant="subtitle2">Name</Typography>
                <Typography variant="body2">{result.name}</Typography>
                <Link component={RouterLink} to={`/competitor/${result.id}`} underline="hover">
                  All results
                </Link>
              </Grid>

              <Grid item>
                <Typography variant="subtitle2">Country</Typography>

                <Box display="flex" alignItems="center" gap={1}>
                  <FlagIcon code={result.country?.code?.toLowerCase()} />
                  <Typography variant="body2" sx={{ color: "text.primary" }} noWrap>
                    {result.country?.name ?? "—"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item>
                <Typography variant="subtitle2">Category</Typography>
                <Typography variant="body2">{result.category}</Typography>
              </Grid>
              {isDivisionBased && (
                <Grid item>
                  <Typography variant="subtitle2">Division</Typography>
                  <Typography variant="body2">
                    <Box component="span" display="inline-flex" alignItems="center">
                      {result.calculatedDivision || "N/A"}
                      {renderDivisionChangeIcon(result.divisionChange)}
                    </Box>
                  </Typography>
                </Grid>
              )}
              {hasScore && (
                <Grid item>
                  <Typography variant="subtitle2">Score</Typography>
                  <Typography variant="body2">{formatScore(result, eventId)}</Typography>
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
