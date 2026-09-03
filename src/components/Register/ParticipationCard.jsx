import {
  Alert,
  Avatar,
  Box,
  Chip,
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
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
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

function maskEmail(email) {
  if (!email) return null;
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(user.length - visible.length, 1))}@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length <= 2) return phone;
  const visible = digits.slice(-2);
  return `${"*".repeat(digits.length - 2)}${visible}`;
}

function capitalize(value) {
  if (!value) return value;
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function WelcomeBackBanner({ profile, previousDivision }) {
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
            We found your previous Cubuzzle profile and prefilled what we can.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {profile.email && (
              <Chip
                size="small"
                variant="outlined"
                icon={<EmailOutlinedIcon fontSize="small" />}
                label={maskEmail(profile.email)}
              />
            )}
            {profile.phoneNo && (
              <Chip
                size="small"
                variant="outlined"
                icon={<LocalPhoneOutlinedIcon fontSize="small" />}
                label={maskPhone(profile.phoneNo)}
              />
            )}
            {profile.gender && (
              <Chip
                size="small"
                variant="outlined"
                icon={<WcOutlinedIcon fontSize="small" />}
                label={capitalize(profile.gender)}
              />
            )}
            {previousDivision && (
              <Chip
                size="small"
                color="primary"
                icon={<EmojiEventsOutlinedIcon fontSize="small" />}
                label={`Division ${previousDivision}`}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function ParticipationCard({
  form,
  userIdStatus,
  profile,
  previousDivision,
  step = 1,
}) {
  const { values, errors, fieldProps } = form;

  return (
    <FormSection
      id="section-participant"
      step={step}
      title="Returning participant?"
      description="If you've competed with Cubuzzle before, we'll look up your profile and skip the details we already have."
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

        {profile && (
          <WelcomeBackBanner
            profile={profile}
            previousDivision={previousDivision}
          />
        )}
      </Stack>
    </FormSection>
  );
}

export default ParticipationCard;
