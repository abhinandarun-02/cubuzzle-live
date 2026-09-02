import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import ChoiceGroup from "./ChoiceGroup";
import SectionHeader from "./SectionHeader";
import TextInput from "./TextInput";
import { styles } from "./styles";

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
    <Alert severity="success" icon={false} sx={{ alignItems: "center" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Avatar src={profile.imageUrl} alt={profile.name} sx={{ width: 56, height: 56 }} />

        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Welcome back, {profile.name}!
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
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
                variant="outlined"
                color="primary"
                icon={<EmojiEventsOutlinedIcon fontSize="small" />}
                label={`Division ${previousDivision} (from your last competition)`}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Alert>
  );
}

function ParticipationCard({ form, userIdStatus, profile, previousDivision }) {
  const { values, errors, fieldProps } = form;

  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <SectionHeader icon={PersonSearchOutlinedIcon} title="Returning Participant?" />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChoiceGroup
              label="Are you a previous Cubuzzle participant?"
              options={[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ]}
              columns="repeat(2, minmax(0, 200px))"
              cardSx={{ justifyContent: "center", minHeight: 44 }}
              {...fieldProps("isPreviousParticipant")}
            />
          </Grid>

          {values.isPreviousParticipant === true && (
            <Grid item xs={12}>
              <TextInput
                label="Cubuzzle ID"
                icon={HowToRegOutlinedIcon}
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
            </Grid>
          )}

          {profile && (
            <Grid item xs={12}>
              <WelcomeBackBanner profile={profile} previousDivision={previousDivision} />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ParticipationCard;
