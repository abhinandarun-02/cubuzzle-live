import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { registerCompetitor } from "../../lib/firebase/register";
import { copyTempImageToUser } from "../../lib/firebase/storage";
import CompetitionDetails from "./CompetitionDetails";
import CompetitorDetails from "./CompetitorDetails";
import ParticipationCard from "./ParticipationCard";
import RegistrationSuccess from "./RegistrationSuccess";
import { COMPETITION_ID } from "./constants";
import usePreviousDivision from "./usePreviousDivision";
import usePreviousParticipant from "./usePreviousParticipant";
import useRegistrationForm from "./useRegistrationForm";

const NOT_FOUND_DIVISION_HINT =
  "We couldn't find a previous 3x3 result for your ID, so pick the division closest to your typical 3x3 average";

function Register() {
  const form = useRegistrationForm();
  const { values, setSkipDivision, setField } = form;

  const { status, profile } = usePreviousParticipant({
    userId: values.userId,
    enabled: values.isPreviousParticipant === true,
    hasLocalPhoto: Boolean(form.photoFile || form.tempImagePath || form.photoUploadStatus === "uploading"),
    onProfileLoaded: form.applyProfile,
    onLookupReset: form.clearExistingPhoto,
  });

  const isReturning = values.isPreviousParticipant === true;

  const {
    division: previousDivision,
    isResolved: divisionResolved,
  } = usePreviousDivision({
    userId: profile?.id,
    enabled: isReturning && Boolean(profile),
  });

  // Keep the form's validation aware of whether a previous division was
  // derived, as a safety net alongside writing it directly into the value.
  useEffect(() => {
    setSkipDivision(isReturning && divisionResolved && Boolean(previousDivision));
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
      queryClient.invalidateQueries(["competition", COMPETITION_ID, "competitors"]);
      setRegisteredCompetitor(competitor);
      enqueueSnackbar("Registration successful!", { variant: "success" });
    },

    onError: (error) => {
      if (error.code === "functions/already-exists") {
        enqueueSnackbar("This Cubuzzle ID is already registered. Please choose another.", { variant: "error" });
        form.setError("userId", "Already registered");
      } else {
        enqueueSnackbar("Registration failed. Please try again.", { variant: "error" });
      }
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();


    const validationErrors = form.validate();
    if (Object.keys(validationErrors).length > 0) {
      enqueueSnackbar(Object.values(validationErrors)[0], { variant: "error" });
      return;
    }

    if (values.isPreviousParticipant) {
      if (status === "taken") {
        enqueueSnackbar("This Cubuzzle ID is already registered", { variant: "error" });
        return;
      }

      if (!profile) {
        enqueueSnackbar("No previous Cubuzzle profile found for this ID", { variant: "error" });
        return;
      }
    }

    registerMutation.mutate(values);
  };

  const handleRegisterAnother = () => {
    setRegisteredCompetitor(null);
    form.reset();
  };

  // Show registration success after successful registration
  if (registeredCompetitor) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <RegistrationSuccess
          competitor={registeredCompetitor}
          onRegisterAnother={handleRegisterAnother}
        />
      </Container>
    );
  }

  // Division is hidden the moment "Yes" is selected and only reappears once
  // the lookup has resolved and found nothing to derive.
  const showDivision = !isReturning || (divisionResolved && !previousDivision);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Register for Cubuzzle Season 5
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Fill in your details to register for the competition
      </Typography>

      <form onSubmit={handleSubmit}>
        <ParticipationCard
          form={form}
          userIdStatus={status}
          profile={profile}
          previousDivision={previousDivision}
        />
        <CompetitorDetails form={form} hiddenFields={form.hiddenFields} />
        <CompetitionDetails
          form={form}
          showDivision={showDivision}
          divisionHint={isReturning ? NOT_FOUND_DIVISION_HINT : undefined}
        />
        <FormControl
          required
          error={Boolean(form.errors.termsConsent)}
          sx={{ display: "block", mb: 3 }}
        >
          <FormLabel sx={{ mb: 0.75, fontWeight: 500 }}>Terms</FormLabel>
          <FormControlLabel
            sx={{ alignItems: "flex-start", ml: 0 }}
            control={
              <Checkbox
                checked={values.termsConsent === true}
                onChange={(event) => setField("termsConsent", event.target.checked)}
                sx={{ pt: 0.25 }}
              />
            }
            label="I agree to comply by the rules and give consent for Cubuzzle to use my photos, videos, and competition data."
          />
          {form.errors.termsConsent && (
            <FormHelperText>{form.errors.termsConsent}</FormHelperText>
          )}
        </FormControl>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button type="submit" variant="contained" size="large" sx={{ minWidth: 200 }}
            disabled={registerMutation.isPending || form.photoUploadStatus === "uploading" || values.isPreviousParticipant === true && (status === "taken" || status === "missing" || !profile)}
          >
            {registerMutation.isPending ? "Registering..." : "Register"}
          </Button>
        </Box>
      </form>
    </Container>
  );
}

export default Register;
