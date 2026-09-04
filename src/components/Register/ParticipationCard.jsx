import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import ChoiceGroup from "./ChoiceGroup";
import FormSection from "./FormSection";
import TextInput from "./TextInput";

function UserIdStatusAdornment({ status }) {
  if (!status) return null;

  return (
    <InputAdornment position="end">
      {status === "checking" && <CircularProgress size={20} />}
      {status === "available" && (
        <CheckCircleIcon color="success" fontSize="small" />
      )}
      {(status === "taken" || status === "missing") && (
        <ErrorIcon color="error" fontSize="small" />
      )}
    </InputAdornment>
  );
}

function WelcomeBackBanner({ profile }) {
  return (
    <Box
      sx={{
        p: { xs: 1.75, sm: 2 },
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "success.main",
        bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Avatar
          src={profile.imageUrl}
          alt={profile.name}
          sx={{
            width: 64,
            height: 64,
            border: "2px solid",
            borderColor: "success.main",
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Welcome back, {profile.name}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We found your previous Cubuzzle profile and prefilled what we can.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function ParticipationCard({ form, userIdStatus, profile, step = 1 }) {
  const { values, errors, fieldProps } = form;

  return (
    <FormSection
      id="section-participant"
      step={step}
      title="Returning Participant?"
      description="If you've competed with Cubuzzle before, we'll look up your profile and lock the details we already have."
    >
      <Stack spacing={2.5}>
        <ChoiceGroup
          label="Have you competed with Cubuzzle before?"
          options={[
            {
              value: true,
              label: "Yes, I'm returning",
              hint: "We'll look up your Cubuzzle ID",
              icon: HowToRegOutlinedIcon,
            },
            {
              value: false,
              label: "No, first time",
              hint: "You'll get a new Cubuzzle ID",
              icon: PersonAddAltOutlinedIcon,
            },
          ]}
          columns={{ xs: 1, sm: 2 }}
          cardSx={{ gap: 1.25, minHeight: 88, alignItems: "flex-start" }}
          {...fieldProps("isPreviousParticipant")}
        />

        {values.isPreviousParticipant === true && (
          <TextInput
            label="Cubuzzle ID"
            icon={HowToRegOutlinedIcon}
            autoComplete="off"
            spellCheck={false}
            {...fieldProps("userId")}
            error={Boolean(errors.userId) || userIdStatus === "missing"}
            helperText={
              errors.userId ||
              (userIdStatus === "missing"
                ? "No previous Cubuzzle profile found for this ID"
                : "Use the same Cubuzzle ID from previous seasons, e.g. 2410301AS")
            }
            endAdornment={<UserIdStatusAdornment status={userIdStatus} />}
          />
        )}

        {userIdStatus === "taken" && (
          <Alert severity="error">
            This Cubuzzle ID is already registered for this season. Choose
            another ID or continue as a first-time competitor.
          </Alert>
        )}

        {profile && values.isPreviousParticipant === true && (
          <WelcomeBackBanner profile={profile} />
        )}
      </Stack>
    </FormSection>
  );
}

export default ParticipationCard;
