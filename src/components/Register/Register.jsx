import { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { createCompetitorId, registerCompetitor} from "../../lib/firebase/firestore";
import { uploadCompetitorImage } from "../../lib/firebase/storage";
import { getCategoryFromDob, normalizeUserId } from "../../lib/registration";
import CompetitionDetails from "./CompetitionDetails";
import CompetitorDetails from "./CompetitorDetails";
import RegistrationSuccess from "./RegistrationSuccess";
import { COMPETITION_ID } from "./constants";
import usePreviousParticipant from "./usePreviousParticipant";
import useRegistrationForm from "./useRegistrationForm";


function Register() {
  const form = useRegistrationForm();

  const { status, profile } = usePreviousParticipant({
    userId: form.values.userId,
    enabled: form.values.isPreviousParticipant === true,
    hasLocalPhoto: Boolean(form.photoFile),
    onProfileLoaded: form.applyProfile,
    onLookupReset: form.clearExistingPhoto,
  });

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [registeredCompetitor, setRegisteredCompetitor] = useState(null);

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const competitorId = data.isPreviousParticipant ? normalizeUserId(data.userId) : createCompetitorId(COMPETITION_ID);
      let imageUrl = form.existingImageUrl;

      if (form.photoFile) {
        imageUrl = await uploadCompetitorImage(COMPETITION_ID, competitorId, form.photoFile);
      }

      const competitor = {
        id: competitorId,
        userId: competitorId,
        name: data.name,
        email: data.email,
        phoneNo: data.phoneNo,
        school: data.school,
        gender: data.gender,
        dob: data.dob,
        category: getCategoryFromDob(data.dob),
        orderId: data.orderId.trim(),
        registeredDivision: data.registeredDivision,
        modeOfParticipation: data.modeOfParticipation,
        country: data.country,
        nationality: data.nationality,
        events: data.events,
        previousUserId: data.isPreviousParticipant ? competitorId : null,
        imageUrl,
      };

      await registerCompetitor(COMPETITION_ID, competitor);
      return competitor;
    },

    onSuccess: (competitor) => {
      queryClient.invalidateQueries(["competition", COMPETITION_ID, "competitors"]);
      setRegisteredCompetitor(competitor);
      enqueueSnackbar("Registration successful!", { variant: "success" });
    },

    onError: (error) => {
      if (error.code === "competitor-id-taken") {
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

    if (form.values.isPreviousParticipant) {
      if (status === "taken") {
        enqueueSnackbar("This Cubuzzle ID is already registered", { variant: "error" });
        return;
      }

      if (!profile) {
        enqueueSnackbar("No previous Cubuzzle profile found for this ID", { variant: "error" });
        return;
      }
    }

    registerMutation.mutate(form.values);
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Register for Cubuzzle Season 5
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Fill in your details to register for the competition
      </Typography>

      <form onSubmit={handleSubmit}>
        <CompetitorDetails form={form} userIdStatus={status} />
        <CompetitionDetails form={form} />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button type="submit" variant="contained" size="large" sx={{ minWidth: 200 }}
            disabled={registerMutation.isPending || form.values.isPreviousParticipant === true && (status === "taken" || status === "missing" || !profile)}
          >
            {registerMutation.isPending ? "Registering..." : "Register"}
          </Button>
        </Box>
      </form>
    </Container>
  );
}

export default Register;
