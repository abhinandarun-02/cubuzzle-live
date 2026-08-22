import { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Avatar,
  Autocomplete,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import useDebounce from "../../hooks/useDebounce";
import { createCompetitorId, getUserProfile, isCompetitorIdAvailable, registerCompetitor } from "../../lib/firebase/firestore";
import { uploadCompetitorImage } from "../../lib/firebase/storage";
import {
  REGISTRATION_EVENTS,
  GENDERS,
  MODES,
  DIVISIONS,
  normalizeUserId,
  resolveCountry,
  validateRegistration,
  validateImageFile,
  getAgeFromDob,
  getCategoryFromDob,
  getCategoryLabel,
} from "../../lib/registration";
import { COUNTRIES, DEFAULT_COUNTRY_CODE, getCountryByCode } from "../../lib/countries";
import FlagIcon from "../FlagIcon/FlagIcon";
import CubingIcon from "../CubingIcon/CubingIcon";
import RegistrationSuccess from "./RegistrationSuccess";

const COMPETITION_ID = "cubuzzle-s5";

const styles = {
  card: {
    mb: 3,
  },
  sectionTitle: {
    mb: 2,
    fontWeight: 500,
  },
  photoUpload: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 2,
  },
  eventCard: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    p: 1.5,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      borderColor: "primary.main",
      bgcolor: "action.hover",
    },
  },
  eventCardSelected: {
    borderColor: "primary.main",
    bgcolor: "action.selected",
  },
};

function getDobHelperText(dob) {
  const category = getCategoryFromDob(dob);
  if (!category) {
    return "Age category is determined from date of birth";
  }

  const age = getAgeFromDob(dob);
  return `Category : ${getCategoryLabel(category)}`;
}

function Register() {
  const [formData, setFormData] = useState({
    userId: "",
    isPreviousParticipant: null,
    name: "",
    email: "",
    phoneNo: "",
    school: "",
    gender: "",
    dob: "",
    orderId: "",
    registeredDivision: "",
    modeOfParticipation: "",
    country: getCountryByCode(DEFAULT_COUNTRY_CODE),
    events: [],
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [registeredCompetitor, setRegisteredCompetitor] = useState(null);
  const lastAppliedProfileIdRef = useRef(null);
  const photoFileRef = useRef(photoFile);
  photoFileRef.current = photoFile;

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Debounced user ID for availability check
  const normalizedUserId = normalizeUserId(formData.userId);
  const debouncedUserId = useDebounce(normalizedUserId, 500);

  // Check user ID availability
  const { data: isAvailable, isLoading: checkingAvailability } = useQuery({
    queryKey: ["competitor-id-availability", COMPETITION_ID, debouncedUserId],
    queryFn: () => isCompetitorIdAvailable(COMPETITION_ID, debouncedUserId),
    enabled: Boolean(
      formData.isPreviousParticipant && debouncedUserId && debouncedUserId.length >= 3
    ),
    staleTime: 10000,
  });

  const {
    data: previousProfile,
    isLoading: loadingProfile,
    isFetched: profileFetched,
  } = useQuery({
    queryKey: ["user-profile", debouncedUserId],
    queryFn: () => getUserProfile(debouncedUserId),
    enabled: Boolean(formData.isPreviousParticipant && debouncedUserId.length >= 3),
    staleTime: 60000,
  });

  useEffect(() => {
    lastAppliedProfileIdRef.current = null;
    if (!photoFileRef.current) {
      setExistingImageUrl(null);
      setPhotoPreview(null);
    }
  }, [normalizedUserId, formData.isPreviousParticipant]);

  useEffect(() => {
    if (!formData.isPreviousParticipant || !previousProfile) return;
    if (previousProfile.id !== debouncedUserId) return;
    if (debouncedUserId !== normalizedUserId) return;
    if (lastAppliedProfileIdRef.current === previousProfile.id) return;

    lastAppliedProfileIdRef.current = previousProfile.id;

    setFormData((prev) => ({
      ...prev,
      name: previousProfile.name ?? prev.name,
      gender: previousProfile.gender
        ? String(previousProfile.gender).toLowerCase()
        : prev.gender,
      country: resolveCountry(previousProfile.country) ?? prev.country,
    }));

    if (!photoFileRef.current && previousProfile.imageUrl) {
      setExistingImageUrl(previousProfile.imageUrl);
      setPhotoPreview(previousProfile.imageUrl);
    }
  }, [
    previousProfile,
    formData.isPreviousParticipant,
    debouncedUserId,
    normalizedUserId,
  ]);

  const previousIdMissing =
    formData.isPreviousParticipant === true &&
    debouncedUserId.length >= 3 &&
    debouncedUserId === normalizedUserId &&
    profileFetched &&
    !loadingProfile &&
    !previousProfile;

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const competitorId = data.isPreviousParticipant
        ? normalizeUserId(data.userId)
        : createCompetitorId(COMPETITION_ID);

      let imageUrl = existingImageUrl;

      // Upload photo if provided
      if (photoFile) {
        imageUrl = await uploadCompetitorImage(COMPETITION_ID, competitorId, photoFile);
      }

      // Register competitor with transaction
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
        events: data.events,
        previousUserId: data.isPreviousParticipant ? competitorId : null,
        ...(imageUrl && { imageUrl }),
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
        enqueueSnackbar("This Cubuzzle ID is already registered. Please choose another.", {
          variant: "error",
        });
        setErrors((prev) => ({ ...prev, userId: "Already registered" }));
      } else {
        enqueueSnackbar("Registration failed. Please try again.", { variant: "error" });
      }
    },
  });

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "userId") {
        next.userId = normalizeUserId(value);
      }

      if (field === "isPreviousParticipant" && value !== true) {
        next.userId = "";
      }

      return next;
    });

    setErrors((prev) => {
      if (!prev[field] && !(field === "isPreviousParticipant" && prev.userId)) {
        return prev;
      }

      const newErrors = { ...prev };
      delete newErrors[field];
      if (field === "isPreviousParticipant") {
        delete newErrors.userId;
      }
      return newErrors;
    });
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    
    // Validate single field
    const validationErrors = validateRegistration(formData);
    if (validationErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleEventToggle = (eventId) => {
    const currentEvents = formData.events;
    const newEvents = currentEvents.includes(eventId)
      ? currentEvents.filter((id) => id !== eventId)
      : [...currentEvents, eventId];

    // Re-sort into canonical order
    const sortedEvents = REGISTRATION_EVENTS.filter((e) => newEvents.includes(e.id)).map((e) => e.id);
    
    handleFieldChange("events", sortedEvents);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate all fields
    const validationErrors = validateRegistration(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const errorMessage = Object.values(validationErrors)[0];
      enqueueSnackbar(errorMessage, { variant: "error" });
      return;
    }

    if (formData.isPreviousParticipant) {
      if (isAvailable === false) {
        enqueueSnackbar("This Cubuzzle ID is already registered", { variant: "error" });
        return;
      }

      if (!previousProfile) {
        enqueueSnackbar("No previous Cubuzzle profile found for this ID", {
          variant: "error",
        });
        return;
      }
    }

    registerMutation.mutate(formData);
  };

  const handleRegisterAnother = () => {
    setRegisteredCompetitor(null);
    setFormData({
      userId: "",
      isPreviousParticipant: null,
      name: "",
      email: "",
      phoneNo: "",
      school: "",
      gender: "",
      dob: "",
      orderId: "",
      registeredDivision: "",
      modeOfParticipation: "",
      country: getCountryByCode(DEFAULT_COUNTRY_CODE),
      events: [],
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setExistingImageUrl(null);
    lastAppliedProfileIdRef.current = null;
    setErrors({});
    setTouchedFields({});
  };

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

  const userIdStatus =
    formData.isPreviousParticipant && normalizedUserId.length >= 3
      ? checkingAvailability || loadingProfile
        ? "checking"
        : previousIdMissing
        ? "missing"
        : isAvailable
        ? "available"
        : "taken"
      : null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Register for Cubuzzle Season 4
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Fill in your details to register for the competition
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Competitor Details */}
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant="h6" sx={styles.sectionTitle}>
              Competitor Details
            </Typography>

            {/* Photo Upload */}
            <Box sx={styles.photoUpload}>
              <Avatar
                src={photoPreview}
                sx={{ width: 120, height: 120 }}
                variant="rounded"
              >
                <PhotoCameraIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
              >
                {photoFile || existingImageUrl ? "Change Photo" : "Upload Photo (Optional)"}
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                />
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Previous Participant */}
              <Grid item xs={12}>
                <FormControl required error={Boolean(errors.isPreviousParticipant)}>
                  <FormLabel>Are you a previous Cubuzzle participant?</FormLabel>
                  <RadioGroup
                    row
                    value={formData.isPreviousParticipant === null ? "" : String(formData.isPreviousParticipant)}
                    onChange={(e) => handleFieldChange("isPreviousParticipant", e.target.value === "true")}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                  {errors.isPreviousParticipant && (
                    <FormHelperText>{errors.isPreviousParticipant}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {formData.isPreviousParticipant === true && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Cubuzzle ID"
                    value={formData.userId}
                    onChange={(e) => handleFieldChange("userId", e.target.value)}
                    onBlur={() => handleBlur("userId")}
                    error={Boolean(errors.userId) || previousIdMissing}
                    helperText={
                      errors.userId ||
                      (previousIdMissing
                        ? "No previous Cubuzzle profile found for this ID"
                        : "Use the same Cubuzzle ID from previous seasons")
                    }
                    InputProps={{
                      endAdornment: userIdStatus && (
                        <InputAdornment position="end">
                          {userIdStatus === "checking" && (
                            <CircularProgress size={20} />
                          )}
                          {userIdStatus === "available" && (
                            <CheckCircleIcon color="success" fontSize="small" />
                          )}
                          {(userIdStatus === "taken" || userIdStatus === "missing") && (
                            <ErrorIcon color="error" fontSize="small" />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}

              {/* Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Phone Number"
                  value={formData.phoneNo}
                  onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                  onBlur={() => handleBlur("phoneNo")}
                  error={Boolean(errors.phoneNo)}
                  helperText={errors.phoneNo}
                />
              </Grid>

              {/* School */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="School"
                  value={formData.school}
                  onChange={(e) => handleFieldChange("school", e.target.value)}
                  onBlur={() => handleBlur("school")}
                  error={Boolean(errors.school)}
                  helperText={errors.school}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} md={6}>
                <FormControl required error={Boolean(errors.gender)}>
                  <FormLabel>Gender</FormLabel>
                  <RadioGroup
                    value={formData.gender}
                    onChange={(e) => handleFieldChange("gender", e.target.value)}
                  >
                    {GENDERS.map((gender) => (
                      <FormControlLabel
                        key={gender.value}
                        value={gender.value}
                        control={<Radio />}
                        label={gender.label}
                      />
                    ))}
                  </RadioGroup>
                  {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Date of Birth */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={(e) => handleFieldChange("dob", e.target.value)}
                  onBlur={() => handleBlur("dob")}
                  error={Boolean(errors.dob)}
                  helperText={errors.dob || getDobHelperText(formData.dob)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    max: new Date().toLocaleDateString("en-CA"),
                  }}
                />
              </Grid>

              {/* Order ID */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Order ID"
                  value={formData.orderId}
                  onChange={(e) => handleFieldChange("orderId", e.target.value)}
                  onBlur={() => handleBlur("orderId")}
                  error={Boolean(errors.orderId)}
                  helperText={errors.orderId}
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12}>
                <Autocomplete
                  options={COUNTRIES}
                  getOptionLabel={(option) => option.name}
                  value={formData.country}
                  onChange={(event, newValue) => handleFieldChange("country", newValue)}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: "flex", gap: 1 }}>
                      <FlagIcon code={option.code.toLowerCase()} />
                      {option.name}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Country"
                      error={Boolean(errors.country)}
                      helperText={errors.country}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: formData.country && (
                          <InputAdornment position="start">
                            <FlagIcon code={formData.country.code.toLowerCase()} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Competition Details */}
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant="h6" sx={styles.sectionTitle}>
              Competition Details
            </Typography>

            <Grid container spacing={3}>
              {/* Division */}
              <Grid item xs={12} md={6}>
                <FormControl required error={Boolean(errors.registeredDivision)}>
                  <FormLabel>Division</FormLabel>
                  <RadioGroup
                    value={formData.registeredDivision}
                    onChange={(e) =>
                      handleFieldChange("registeredDivision", e.target.value)
                    }
                  >
                    {DIVISIONS.map((division) => (
                      <FormControlLabel
                        key={division.value}
                        value={division.value}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2">
                              {division.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {division.hint}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                  {errors.registeredDivision && (
                    <FormHelperText>{errors.registeredDivision}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Mode */}
              <Grid item xs={12} md={6}>
                <FormControl required error={Boolean(errors.modeOfParticipation)}>
                  <FormLabel>Mode of Participation</FormLabel>
                  <RadioGroup
                    value={formData.modeOfParticipation}
                    onChange={(e) =>
                      handleFieldChange("modeOfParticipation", e.target.value)
                    }
                  >
                    {MODES.map((mode) => (
                      <FormControlLabel
                        key={mode.value}
                        value={mode.value}
                        control={<Radio />}
                        label={mode.label}
                      />
                    ))}
                  </RadioGroup>
                  {errors.modeOfParticipation && (
                    <FormHelperText>{errors.modeOfParticipation}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Events */}
              <Grid item xs={12}>
                <FormControl required error={Boolean(errors.events)} fullWidth>
                  <FormLabel>Events (select at least one)</FormLabel>
                  <Box sx={styles.eventGrid}>
                    {REGISTRATION_EVENTS.map((event) => {
                      const isSelected = formData.events.includes(event.id);
                      return (
                        <Box
                          key={event.id}
                          sx={{
                            ...styles.eventCard,
                            ...(isSelected && styles.eventCardSelected),
                          }}
                          onClick={() => handleEventToggle(event.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            size="small"
                            sx={{ p: 0 }}
                          />
                          <CubingIcon eventId={event.id} small />
                          <Typography variant="body2">{event.label}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  {errors.events && <FormHelperText>{errors.events}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={
              registerMutation.isPending ||
              (formData.isPreviousParticipant === true &&
                (userIdStatus === "taken" ||
                  previousIdMissing ||
                  !previousProfile))
            }
            sx={{ minWidth: 200 }}
          >
            {registerMutation.isPending ? "Registering..." : "Register"}
          </Button>
        </Box>
      </form>
    </Container>
  );
}

export default Register;
