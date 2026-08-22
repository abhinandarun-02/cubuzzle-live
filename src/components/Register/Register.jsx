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
  FormHelperText,
  Avatar,
  Autocomplete,
  CircularProgress,
  InputAdornment,
  Stack,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import CloseIcon from "@mui/icons-material/Close";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
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
    gap: 1.25,
    mb: 3.5,
  },
  photoDropzone: {
    position: "relative",
    width: 128,
    height: 128,
    borderRadius: "50%",
    cursor: "pointer",
    "&:hover .photo-overlay": {
      opacity: 1,
    },
  },
  photoOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
    color: "#fff",
    bgcolor: "rgba(0,0,0,0.55)",
    opacity: 0,
    transition: "opacity 0.15s",
    pointerEvents: "none",
  },
  photoRemoveBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    bgcolor: "background.paper",
    boxShadow: 1,
    "&:hover": {
      bgcolor: "error.main",
      color: "#fff",
    },
  },
  fieldLabel: {
    mb: 0.75,
    fontWeight: 500,
  },
  fieldHint: {
    mb: 1.5,
    display: "block",
  },
  sectionCaption: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: "text.secondary",
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontSize: 12,
  },
  yesNoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 200px))",
    gap: 1.25,
  },
  genderGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "repeat(1, minmax(0, 1fr))",
      sm: "repeat(3, minmax(0, 1fr))",
    },
    gap: 1.25,
  },
  choiceCard: {
    appearance: "none",
    WebkitAppearance: "none",
    display: "flex",
    alignItems: "center",
    width: "100%",
    m: 0,
    px: 1.75,
    py: 1.5,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    bgcolor: "transparent",
    color: "inherit",
    font: "inherit",
    textAlign: "left",
    cursor: "pointer",
    userSelect: "none",
    transition: "border-color 0.15s, background-color 0.15s",
    "&:hover": {
      borderColor: "primary.main",
      bgcolor: "action.hover",
    },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: 2,
    },
  },
  choiceCardSelected: {
    borderColor: "primary.main",
    bgcolor: "action.selected",
    boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}`,
  },
  divisionGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "repeat(2, minmax(0, 1fr))",
      sm: "repeat(3, minmax(0, 1fr))",
      md: "repeat(5, minmax(0, 1fr))",
    },
    gap: 1.25,
  },
  modeGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, minmax(0, 220px))",
    },
    gap: 1.25,
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "repeat(2, minmax(0, 1fr))",
      sm: "repeat(4, minmax(0, 1fr))",
    },
    gap: 1.25,
  },
};

function ChoiceCard({ selected, onClick, children, sx, role, ...props }) {
  return (
    <Box
      component="button"
      type="button"
      role={role}
      aria-pressed={role === "radio" ? undefined : selected}
      onClick={onClick}
      sx={{
        ...styles.choiceCard,
        ...(selected && styles.choiceCardSelected),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

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
    nationality: getCountryByCode(DEFAULT_COUNTRY_CODE),
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
      nationality:
        resolveCountry(previousProfile.nationality) ??
        resolveCountry(previousProfile.country) ??
        prev.nationality,
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
    setErrors((prev) => {
      if (!prev.photo) return prev;
      const next = { ...prev };
      delete next.photo;
      return next;
    });
  };

  const handlePhotoRemove = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setPhotoFile(null);
    setPhotoPreview(null);
    setExistingImageUrl(null);
    setErrors((prev) => ({ ...prev, photo: "Photo is required" }));
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
    if (!photoFile && !existingImageUrl) {
      validationErrors.photo = "Photo is required";
    }

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
      nationality: getCountryByCode(DEFAULT_COUNTRY_CODE),
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
            <FormControl required error={Boolean(errors.photo)} sx={styles.photoUpload}>
              <FormLabel sx={styles.fieldLabel}>Photo</FormLabel>
              <Box component="label" sx={styles.photoDropzone}>
                <Avatar
                  src={photoPreview}
                  sx={{
                    width: 128,
                    height: 128,
                    borderWidth: 3,
                    borderStyle: errors.photo || photoPreview ? "solid" : "dashed",
                    borderColor: errors.photo ? "error.main" : "divider",
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                </Avatar>
                <Box className="photo-overlay" sx={styles.photoOverlay}>
                  <PhotoCameraIcon fontSize="small" />
                  <Typography variant="caption" fontWeight={600}>
                    {photoFile || existingImageUrl ? "Change" : "Upload"}
                  </Typography>
                </Box>
                {(photoFile || photoPreview) && (
                  <Tooltip title="Remove photo">
                    <IconButton
                      size="small"
                      sx={styles.photoRemoveBtn}
                      onClick={handlePhotoRemove}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                JPEG, PNG or WebP, up to 5&nbsp;MB
              </Typography>
              {errors.photo && <FormHelperText>{errors.photo}</FormHelperText>}
            </FormControl>

            <Grid container spacing={3}>
              {/* Previous Participant */}
              <Grid item xs={12}>
                <FormControl required error={Boolean(errors.isPreviousParticipant)} fullWidth>
                  <FormLabel sx={styles.fieldLabel}>
                    Are you a previous Cubuzzle participant?
                  </FormLabel>
                  <Box role="radiogroup" aria-label="Previous participant" sx={styles.yesNoGrid}>
                    {[
                      { value: true, label: "Yes" },
                      { value: false, label: "No" },
                    ].map((option) => {
                      const selected = formData.isPreviousParticipant === option.value;
                      return (
                        <ChoiceCard
                          key={String(option.value)}
                          role="radio"
                          aria-checked={selected}
                          selected={selected}
                          onClick={() => handleFieldChange("isPreviousParticipant", option.value)}
                          sx={{ justifyContent: "center", minHeight: 44 }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {option.label}
                          </Typography>
                        </ChoiceCard>
                      );
                    })}
                  </Box>
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
                      startAdornment: (
                        <InputAdornment position="start">
                          <HowToRegOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
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

              <Grid item xs={12}>
                <Divider sx={{ mb: -1 }}>
                  <Typography sx={styles.sectionCaption}>Personal Information</Typography>
                </Divider>
              </Grid>

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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalPhoneOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* School */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="School"
                  value={formData.school}
                  onChange={(e) => handleFieldChange("school", e.target.value)}
                  onBlur={() => handleBlur("school")}
                  error={Boolean(errors.school)}
                  helperText={errors.school}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
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

              {/* Gender */}
              <Grid item xs={12} md={6}>
                <FormControl required error={Boolean(errors.gender)} fullWidth>
                  <FormLabel sx={styles.fieldLabel}>Gender</FormLabel>
                  <Box role="radiogroup" aria-label="Gender" sx={styles.genderGrid}>
                    {GENDERS.map((gender) => {
                      const selected = formData.gender === gender.value;
                      return (
                        <ChoiceCard
                          key={gender.value}
                          role="radio"
                          aria-checked={selected}
                          selected={selected}
                          onClick={() => handleFieldChange("gender", gender.value)}
                          sx={{ justifyContent: "center", minHeight: 44 }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {gender.label}
                          </Typography>
                        </ChoiceCard>
                      );
                    })}
                  </Box>
                  {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ mb: -1 }}>
                  <Typography sx={styles.sectionCaption}>Registration Details</Typography>
                </Divider>
              </Grid>

              {/* Order ID */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Order ID"
                  value={formData.orderId}
                  onChange={(e) => handleFieldChange("orderId", e.target.value)}
                  onBlur={() => handleBlur("orderId")}
                  error={Boolean(errors.orderId)}
                  helperText={errors.orderId}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ConfirmationNumberOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12} md={6}>
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

              {/* Nationality */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={COUNTRIES}
                  getOptionLabel={(option) => option.name}
                  value={formData.nationality}
                  onChange={(event, newValue) => handleFieldChange("nationality", newValue)}
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
                      label="Nationality"
                      error={Boolean(errors.nationality)}
                      helperText={errors.nationality}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: formData.nationality && (
                          <InputAdornment position="start">
                            <FlagIcon code={formData.nationality.code.toLowerCase()} />
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

            <Stack spacing={3.5}>
              <FormControl required error={Boolean(errors.registeredDivision)}>
                <FormLabel sx={styles.fieldLabel}>Division</FormLabel>
                <Typography variant="caption" color="text.secondary" sx={styles.fieldHint}>
                  Choose the division closest to your typical 3x3 average
                </Typography>
                <Box
                  role="radiogroup"
                  aria-label="Division"
                  sx={styles.divisionGrid}
                >
                  {DIVISIONS.map((division) => {
                    const selected = formData.registeredDivision === division.value;
                    return (
                      <ChoiceCard
                        key={division.value}
                        role="radio"
                        aria-checked={selected}
                        selected={selected}
                        onClick={() =>
                          handleFieldChange("registeredDivision", division.value)
                        }
                        sx={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 0.5,
                          minHeight: 76,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                          {division.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {division.hint}
                        </Typography>
                      </ChoiceCard>
                    );
                  })}
                </Box>
                {errors.registeredDivision && (
                  <FormHelperText>{errors.registeredDivision}</FormHelperText>
                )}
              </FormControl>

              <FormControl required error={Boolean(errors.modeOfParticipation)}>
                <FormLabel sx={styles.fieldLabel}>Mode of Participation</FormLabel>
                <Box
                  role="radiogroup"
                  aria-label="Mode of Participation"
                  sx={styles.modeGrid}
                >
                  {MODES.map((mode) => {
                    const selected = formData.modeOfParticipation === mode.value;
                    const Icon = mode.value === "onsite" ? PlaceOutlinedIcon : LanguageIcon;
                    return (
                      <ChoiceCard
                        key={mode.value}
                        role="radio"
                        aria-checked={selected}
                        selected={selected}
                        onClick={() =>
                          handleFieldChange("modeOfParticipation", mode.value)
                        }
                        sx={{ gap: 1.25, minHeight: 56 }}
                      >
                        <Icon fontSize="small" color={selected ? "primary" : "action"} />
                        <Typography variant="body2" fontWeight={600}>
                          {mode.label}
                        </Typography>
                      </ChoiceCard>
                    );
                  })}
                </Box>
                {errors.modeOfParticipation && (
                  <FormHelperText>{errors.modeOfParticipation}</FormHelperText>
                )}
              </FormControl>

              <FormControl required error={Boolean(errors.events)} fullWidth>
                <FormLabel sx={styles.fieldLabel}>Events</FormLabel>
                <Typography variant="caption" color="text.secondary" sx={styles.fieldHint}>
                  Select every event you want to compete in
                </Typography>
                <Box role="group" aria-label="Events" sx={styles.eventGrid}>
                  {REGISTRATION_EVENTS.map((event) => {
                    const isSelected = formData.events.includes(event.id);
                    return (
                      <ChoiceCard
                        key={event.id}
                        selected={isSelected}
                        onClick={() => handleEventToggle(event.id)}
                        sx={{ gap: 1.25, minHeight: 56 }}
                      >
                        <CubingIcon eventId={event.id} />
                        <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                          {event.label}
                        </Typography>
                        {isSelected && (
                          <CheckCircleIcon color="primary" fontSize="small" />
                        )}
                      </ChoiceCard>
                    );
                  })}
                </Box>
                {errors.events && <FormHelperText>{errors.events}</FormHelperText>}
              </FormControl>
            </Stack>
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
