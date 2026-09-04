import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PeopleIcon from "@mui/icons-material/People";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useSnackbar } from "notistack";
import CubingIcon from "../CubingIcon/CubingIcon";
import { getEventDisplayName } from "../../lib/competition";

const popIn = keyframes`
  0% { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

function RegistrationSuccess({ competitor, onRegisterAnother }) {
  const { enqueueSnackbar } = useSnackbar();
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(competitor.id);
      setCopied(true);
      enqueueSnackbar("Cubuzzle ID copied", { variant: "success" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      enqueueSnackbar("Couldn't copy the ID. Please copy it manually.", {
        variant: "error",
      });
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        bgcolor: "rgba(12, 16, 24, 0.78)",
        backdropFilter: "blur(18px)",
        borderColor: "rgba(255,255,255,0.12)",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.32)",
      }}
    >
      <Box
        sx={{
          height: 6,
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
        }}
      />
      <Box sx={{ p: { xs: 3, sm: 4.5 }, textAlign: "center" }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: "auto",
            mb: 2,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.14),
            animation: `${popIn} 0.45s ease`,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 42, color: "success.main" }} />
        </Box>
        <Avatar
          src={competitor.imageUrl}
          alt={competitor.name}
          sx={{
            mx: "auto",
            mb: 2,
            width: 104,
            height: 104,
            fontSize: "2.5rem",
            border: "3px solid",
            borderColor: "success.main",
          }}
          variant="rounded"
        />
        <Typography variant="h5" component="h1" fontWeight={800} gutterBottom>
          You&apos;re registered
        </Typography>
        <Typography variant="h6">{competitor.name}</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 2 }}
        >
          Keep this Cubuzzle ID for check-in and future seasons.
        </Typography>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.75,
            py: 1,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "grey.50",
          }}
        >
          <Box sx={{ textAlign: "left" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, letterSpacing: 0.4 }}
            >
              CUBUZZLE ID
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontFamily: "monospace", lineHeight: 1.2 }}
            >
              {competitor.id}
            </Typography>
          </Box>
          <Tooltip title={copied ? "Copied" : "Copy ID"}>
            <IconButton onClick={handleCopyId} aria-label="Copy Cubuzzle ID">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Stack
          direction="row"
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          gap={1}
          sx={{ mt: 2.5 }}
        >
          {competitor.registeredDivision && (
            <Chip
              label={`Division ${competitor.registeredDivision}`}
              color="primary"
              variant="outlined"
            />
          )}
          {competitor.events.map((eventId) => (
            <Chip
              key={eventId}
              icon={<CubingIcon eventId={eventId} small />}
              label={getEventDisplayName(eventId)}
              variant="outlined"
            />
          ))}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          gap={1.5}
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            component={RouterLink}
            to={`/competitor/${competitor.id}`}
            startIcon={<PersonSearchIcon />}
          >
            View your profile
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/competitors"
            startIcon={<PeopleIcon />}
          >
            See competitors
          </Button>
          <Button onClick={onRegisterAnother} startIcon={<RestartAltIcon />}>
            Register another
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}

export default RegistrationSuccess;
