import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import scrollIntoView from "scroll-into-view-if-needed";
import { registerCompetitor } from "../../lib/firebase/register";
import { copyTempImageToUser } from "../../lib/firebase/storage";
import CompetitionDetails from "./CompetitionDetails";
import CompetitorDetails from "./CompetitorDetails";
import ParticipationCard from "./ParticipationCard";
import RegisterHero from "./RegisterHero";
import RegistrationSuccess from "./RegistrationSuccess";
import { COMPETITION_ID } from "./constants";
import { styles } from "./styles";
import usePreviousDivision from "./usePreviousDivision";
import usePreviousParticipant from "./usePreviousParticipant";
import useRegistrationForm from "./useRegistrationForm";

const NOT_FOUND_DIVISION_HINT =
  "We couldn't find a previous 3x3 result for your ID, so pick the division closest to your typical 3x3 average";

const FIELD_ORDER = [
  "isPreviousParticipant",
  "userId",
  "photo",
  "name",
  "email",
  "phoneNo",
  "school",
  "dob",
  "gender",
  "orderId",
  "country",
  "nationality",
  "registeredDivision",
  "modeOfParticipation",
  "events",
  "termsConsent",
];

const SECTIONS = [
  { id: "section-participant", label: "Participant" },
  { id: "section-details", label: "Your details" },
  { id: "section-competition", label: "Competition" },
];

function scrollToField(name) {
  const el = document.querySelector(`[data-field="${name}"]`);
  if (!el) {
    return;
  }

  scrollIntoView(el, {
    behavior: "smooth",
    block: "center",
    scrollMode: "always",
  });

  window.setTimeout(() => {
    const focusable = el.matches("input, textarea, button, select")
      ? el
      : el.querySelector(
          "input, textarea, button, select, [tabindex]:not([tabindex='-1'])",
        );
    focusable?.focus?.({ preventScroll: true });
  }, 350);
}

function getCompletionState({
  values,
  hiddenFields,
  showDivision,
  photoReady,
}) {
  const checks = [];
  checks.push(
    values.isPreviousParticipant !== null &&
      values.isPreviousParticipant !== undefined,
  );
  if (values.isPreviousParticipant === true) {
    checks.push(Boolean(values.userId));
  }
  checks.push(photoReady);

  const hidden = new Set(hiddenFields);
  ["name", "email", "phoneNo", "gender"].forEach((field) => {
    if (!hidden.has(field)) {
      checks.push(Boolean(values[field]));
    }
  });

  checks.push(Boolean(values.school));
  checks.push(Boolean(values.dob));
  checks.push(Boolean(values.orderId));
  checks.push(Boolean(values.country?.code));
  checks.push(Boolean(values.nationality?.code));
  if (showDivision) {
    checks.push(Boolean(values.registeredDivision));
  }
  checks.push(Boolean(values.modeOfParticipation));
  checks.push(Array.isArray(values.events) && values.events.length > 0);
  checks.push(values.termsConsent === true);

  const total = checks.length;
  const complete = checks.filter(Boolean).length;
  return {
    total,
    complete,
    remaining: total - complete,
    percent: total === 0 ? 0 : Math.round((complete / total) * 100),
  };
}

function getSubmitHint({
  values,
  photoUploadStatus,
  status,
  profile,
  isPending,
  remaining,
}) {
  if (isPending) {
    return "Submitting your registration…";
  }
  if (photoUploadStatus === "uploading") {
    return "Photo is still uploading — hang tight.";
  }
  if (values.isPreviousParticipant === true) {
    if (status === "checking") {
      return "Looking up your Cubuzzle ID…";
    }
    if (status === "taken") {
      return "This Cubuzzle ID is already registered for this season.";
    }
    if (status === "missing") {
      return "No previous Cubuzzle profile was found for this ID.";
    }
    if (!profile) {
      return "Enter your Cubuzzle ID so we can prefill your details.";
    }
  }
  if (remaining > 0) {
    return `${remaining} required field${remaining === 1 ? "" : "s"} remaining`;
  }
  return "All set — submit your registration";
}

function Register() {
  const form = useRegistrationForm();
  const { values, setSkipDivision, setField } = form;

  const { status, profile } = usePreviousParticipant({
    userId: values.userId,
    enabled: values.isPreviousParticipant === true,
    hasLocalPhoto: Boolean(
      form.photoFile ||
        form.tempImagePath ||
        form.photoUploadStatus === "uploading",
    ),
    onProfileLoaded: form.applyProfile,
    onLookupReset: form.clearExistingPhoto,
  });

  const isReturning = values.isPreviousParticipant === true;

  const { division: previousDivision, isResolved: divisionResolved } =
    usePreviousDivision({
      userId: profile?.id,
      enabled: isReturning && Boolean(profile),
    });

  useEffect(() => {
    setSkipDivision(
      isReturning && divisionResolved && Boolean(previousDivision),
    );
  }, [isReturning, divisionResolved, previousDivision, setSkipDivision]);

  useEffect(() => {
    if (previousDivision && values.registeredDivision !== previousDivision) {
      setField("registeredDivision", previousDivision);
    }
  }, [previousDivision, values.registeredDivision, setField]);

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [registeredCompetitor, setRegisteredCompetitor] = useState(null);

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        competitionId: COMPETITION_ID,
        isPreviousParticipant: data.isPreviousParticipant,
        name: data.name,
        email: data.email,
        phoneNo: data.phoneNo,
        school: data.school,
        gender: data.gender,
        dob: data.dob,
        orderId: data.orderId.trim(),
        registeredDivision: previousDivision ?? data.registeredDivision,
        modeOfParticipation: data.modeOfParticipation,
        country: data.country,
        nationality: data.nationality,
        events: data.events,
      };

      if (data.isPreviousParticipant) {
        payload.userId = data.userId;
      }

      if (form.tempImagePath) {
        payload.tempImagePath = form.tempImagePath;
      } else {
        payload.imageUrl = form.existingImageUrl;
      }

      const competitor = await registerCompetitor(payload);

      let imageUrl = competitor.imageUrl;
      if (form.tempImagePath) {
        imageUrl = await copyTempImageToUser({
          competitionId: COMPETITION_ID,
          userId: competitor.id,
        });
      }

      return { ...competitor, imageUrl };
    },

    onSuccess: (competitor) => {
      queryClient.invalidateQueries([
        "competition",
        COMPETITION_ID,
        "competitors",
      ]);
      setRegisteredCompetitor(competitor);
      enqueueSnackbar("Registration successful!", { variant: "success" });
    },

    onError: (error) => {
      if (error.code === "functions/already-exists") {
        enqueueSnackbar(
          "This Cubuzzle ID is already registered. Please choose another.",
          { variant: "error" },
        );
        form.setError("userId", "Already registered");
        scrollToField("userId");
      } else {
        const details =
          typeof error.message === "string" &&
          error.code?.startsWith("functions/")
            ? error.message.replace(/^[^:]+:\s*/, "")
            : null;
        enqueueSnackbar(details || "Registration failed. Please try again.", {
          variant: "error",
        });
      }
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = form.validate();
    if (Object.keys(validationErrors).length > 0) {
      const firstError = FIELD_ORDER.find((field) => validationErrors[field]);
      enqueueSnackbar(
        (firstError && validationErrors[firstError]) ||
          Object.values(validationErrors)[0],
        { variant: "error" },
      );
      if (firstError) {
        scrollToField(firstError);
      }
      return;
    }

    if (values.isPreviousParticipant) {
      if (status === "taken") {
        enqueueSnackbar("This Cubuzzle ID is already registered", {
          variant: "error",
        });
        scrollToField("userId");
        return;
      }

      if (!profile) {
        enqueueSnackbar("No previous Cubuzzle profile found for this ID", {
          variant: "error",
        });
        scrollToField("userId");
        return;
      }
    }

    registerMutation.mutate(values);
  };

  const handleRegisterAnother = () => {
    setRegisteredCompetitor(null);
    form.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showDivision = !isReturning || (divisionResolved && !previousDivision);
  const photoReady = Boolean(form.tempImagePath || form.existingImageUrl);
  const completion = getCompletionState({
    values,
    hiddenFields: form.hiddenFields,
    showDivision,
    photoReady,
  });
  const lookupBlocking =
    values.isPreviousParticipant === true &&
    (status === "taken" || status === "missing" || !profile);
  const submitDisabled =
    registerMutation.isPending ||
    form.photoUploadStatus === "uploading" ||
    lookupBlocking;
  const submitHint = getSubmitHint({
    values,
    photoUploadStatus: form.photoUploadStatus,
    status,
    profile,
    isPending: registerMutation.isPending,
    remaining: completion.remaining,
  });

  if (registeredCompetitor) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        <RegistrationSuccess
          competitor={registeredCompetitor}
          onRegisterAnother={handleRegisterAnother}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={styles.page}>
      <Box sx={styles.pageGlow} />
      <Box sx={styles.pageInner}>
        <RegisterHero />

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={styles.form}
          noValidate
        >
          <Box sx={styles.stickyNav}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ flexWrap: "nowrap" }}
            >
              {SECTIONS.map((section, index) => (
                <Chip
                  key={section.id}
                  clickable
                  size="small"
                  variant="outlined"
                  aria-label={section.label}
                  label={
                    <>
                      <Box
                        component="span"
                        sx={{ display: { xs: "none", sm: "inline" } }}
                      >
                        {index + 1}. {section.label}
                      </Box>
                      <Box component="span" sx={{ display: { sm: "none" } }}>
                        {index + 1}
                      </Box>
                    </>
                  }
                  onClick={() =>
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                />
              ))}
              <Box sx={{ flexGrow: 1 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
              >
                {completion.percent}% complete
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={completion.percent}
              sx={{
                mt: 1.25,
                height: 6,
                borderRadius: 999,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                "& .MuiLinearProgress-bar": { borderRadius: 999 },
              }}
            />
          </Box>

          <ParticipationCard
            form={form}
            userIdStatus={status}
            profile={profile}
            previousDivision={previousDivision}
            step={1}
          />
          <CompetitorDetails
            form={form}
            hiddenFields={form.hiddenFields}
            step={2}
          />
          <CompetitionDetails
            form={form}
            showDivision={showDivision}
            divisionHint={isReturning ? NOT_FOUND_DIVISION_HINT : undefined}
            step={3}
          />

          <Box
            data-field="termsConsent"
            sx={{
              ...styles.submitCard,
              mb: 2.5,
              borderColor: form.errors.termsConsent ? "error.main" : "divider",
              bgcolor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === "dark" ? 0.08 : 0.05,
                ),
            }}
          >
            <FormControl
              required
              error={Boolean(form.errors.termsConsent)}
              sx={{ display: "block" }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <VerifiedUserOutlinedIcon
                  color={form.errors.termsConsent ? "error" : "primary"}
                  sx={{ mt: 0.25 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Rules & consent
                  </Typography>
                  <FormControlLabel
                    sx={{ alignItems: "flex-start", ml: 0, mt: 0.5, mr: 0 }}
                    control={
                      <Checkbox
                        checked={values.termsConsent === true}
                        onChange={(event) =>
                          setField("termsConsent", event.target.checked)
                        }
                        sx={{ pt: 0.25, pl: 0 }}
                      />
                    }
                    label="I agree to comply by the rules and give consent for Cubuzzle to use my photos, videos, and competition data."
                  />
                  {form.errors.termsConsent && (
                    <FormHelperText>{form.errors.termsConsent}</FormHelperText>
                  )}
                </Box>
              </Stack>
            </FormControl>
          </Box>

          <Box sx={styles.submitCard}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Ready when you are
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {submitHint}
                </Typography>
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitDisabled}
                startIcon={
                  registerMutation.isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
                sx={{
                  minWidth: 200,
                  py: 1.25,
                  px: 3,
                  borderRadius: 2,
                  fontWeight: 700,
                  boxShadow: (theme) =>
                    `0 10px 22px ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Register;
