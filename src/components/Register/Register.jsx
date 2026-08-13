import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HowToRegIcon from "@mui/icons-material/HowToReg";

import CubingIcon from "../CubingIcon/CubingIcon";
import FlagIcon from "../FlagIcon/FlagIcon";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_CODE,
  getCountryByCode,
} from "../../lib/countries";
import {
  isCompetitorIdAvailable,
  registerCompetitor,
} from "../../lib/firebase/firestore";
import { uploadCompetitorImage } from "../../lib/firebase/storage";
import {
  CATEGORIES,
  DIVISIONS,
  GENDERS,
  MODES,
  REGISTRATION_EVENTS,
  USER_ID_PATTERN,
  normalizeUserId,
  validateImageFile,
  validateRegistration,
} from "../../lib/registration";
import useDebounce from "../../hooks/useDebounce";

import RegistrationSuccess from "./RegistrationSuccess";

const competitionId = "cubuzzle-s4";

const initialValues = {
  userId: "",
  name: "",
  email: "",
  phoneNo: "",
  school: "",
  gender: "",
  category: "",
  registeredDivision: "",
  modeOfParticipation: "",
  country: getCountryByCode(DEFAULT_COUNTRY_CODE),
  events: [],
};

const styles = {
  container: {
    py: 3,
  },
  header: {
    mb: 3,
  },
  card: {
    mb: 3,
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  photoRow: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    flexWrap: "wrap",
  },
  avatar: {
    width: 88,
    height: 88,
    fontSize: "2rem",
  },
  hiddenInput: {
    display: "none",
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, minmax(0, 1fr))",
      md: "repeat(3, minmax(0, 1fr))",
    },
    gap: 1,
  },
  eventOption: {
    m: 0,
    border: 1,
    borderColor: "divider",
    borderRadius: 1,
    px: 1.25,
    py: 0.75,
    minHeight: 48,
  },
  actions: {
    alignItems: { xs: "stretch", sm: "center" },
    justifyContent: "space-between",
    gap: 2,
  },
};

const fieldHasError = (field, errors, touched) =>
  Boolean(errors[field] && touched[field]);

const optionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label ?? value;

function Register() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [values, setValues] = useState(initialValues);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [registeredCompetitor, setRegisteredCompetitor] = useState(null);

  const normalizedUserId = normalizeUserId(values.userId);
  const debouncedUserId = useDebounce(normalizedUserId, 500);
  const canCheckUserId = USER_ID_PATTERN.test(debouncedUserId);

  const availabilityQuery = useQuery({
    queryKey: ["competition", competitionId, "competitor-id", debouncedUserId],
    queryFn: async () =>
      isCompetitorIdAvailable(competitionId, debouncedUserId),
    enabled: canCheckUserId,
  });

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const userIdAvailability = useMemo(() => {
    if (!values.userId || errors.userId) {
      return null;
    }
    if (availabilityQuery.isFetching || debouncedUserId !== normalizedUserId) {
      return { severity: "info", message: "Checking..." };
    }
    if (availabilityQuery.data === true) {
      return { severity: "success", message: "Available" };
    }
    if (availabilityQuery.data === false) {
      return { severity: "error", message: "Already registered" };
    }
    return null;
  }, [
    availabilityQuery.data,
    availabilityQuery.isFetching,
    debouncedUserId,
    errors.userId,
    normalizedUserId,
    values.userId,
  ]);

  const mutation = useMutation({
    mutationFn: async ({ formValues, file }) => {
      const competitorId = normalizeUserId(formValues.userId);
      let imageUrl;

      if (file) {
        imageUrl = await uploadCompetitorImage(
          competitionId,
          competitorId,
          file,
        );
      }

      const competitor = {
        id: competitorId,
        userId: competitorId,
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        phoneNo: formValues.phoneNo.trim(),
        school: formValues.school.trim(),
        gender: formValues.gender,
        category: formValues.category,
        registeredDivision: formValues.registeredDivision,
        events: REGISTRATION_EVENTS.map((event) => event.id).filter((eventId) =>
          formValues.events.includes(eventId),
        ),
        modeOfParticipation: formValues.modeOfParticipation,
        country: {
          code: formValues.country.code,
          name: formValues.country.name,
        },
        ...(imageUrl ? { imageUrl } : {}),
      };

      await registerCompetitor(competitionId, competitor);
      return competitor;
    },
    onSuccess: async (competitor) => {
      await queryClient.invalidateQueries({
        queryKey: ["competition", competitionId, "competitors"],
      });
      setRegisteredCompetitor(competitor);
      enqueueSnackbar("Registration complete.", { variant: "success" });
    },
    onError: (error) => {
      if (error?.code === "competitor-id-taken") {
        setErrors((current) => ({
          ...current,
          userId: "This Cubuzzle ID is already registered",
        }));
        setTouched((current) => ({ ...current, userId: true }));
        enqueueSnackbar("That Cubuzzle ID is already registered.", {
          variant: "error",
        });
        return;
      }
      enqueueSnackbar("Registration failed. Please try again.", {
        variant: "error",
      });
    },
  });

  const setFieldValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => {
      const nextValues = { ...values, [field]: value };
      const nextErrors = validateRegistration(nextValues);
      return { ...current, [field]: nextErrors[field] };
    });
  };

  const handleTextChange = (field) => (event) => {
    const value =
      field === "userId"
        ? event.target.value.toUpperCase()
        : event.target.value;
    setFieldValue(field, value);
  };

  const handleBlur = (field) => () => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validateRegistration(values));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    const nextImageError = validateImageFile(file);

    setPhoto(file && !nextImageError ? file : null);
    setImageError(nextImageError ?? "");
    setPhotoPreview(file && !nextImageError ? URL.createObjectURL(file) : "");
  };

  const handleEventToggle = (eventId) => {
    const nextEvents = values.events.includes(eventId)
      ? values.events.filter((id) => id !== eventId)
      : REGISTRATION_EVENTS.map((event) => event.id).filter((id) =>
          [...values.events, eventId].includes(id),
        );
    setFieldValue("events", nextEvents);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextValues = { ...values, userId: normalizedUserId };
    const nextErrors = validateRegistration(nextValues);
    const nextImageError = validateImageFile(photo);
    const allTouched = Object.keys(initialValues).reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {},
    );

    setValues(nextValues);
    setTouched(allTouched);
    setErrors(nextErrors);
    setImageError(nextImageError ?? "");

    if (Object.keys(nextErrors).length > 0 || nextImageError) {
      enqueueSnackbar("Please fix the highlighted fields.", {
        variant: "error",
      });
      return;
    }

    if (availabilityQuery.isFetching || debouncedUserId !== normalizedUserId) {
      enqueueSnackbar("Please wait while the Cubuzzle ID is checked.", {
        variant: "info",
      });
      return;
    }

    if (availabilityQuery.data === false) {
      setErrors((current) => ({
        ...current,
        userId: "This Cubuzzle ID is already registered",
      }));
      enqueueSnackbar("That Cubuzzle ID is already registered.", {
        variant: "error",
      });
      return;
    }

    mutation.mutate({ formValues: nextValues, file: photo });
  };

  const handleRegisterAnother = () => {
    setValues(initialValues);
    setPhoto(null);
    setPhotoPreview("");
    setImageError("");
    setErrors({});
    setTouched({});
    setRegisteredCompetitor(null);
  };

  if (registeredCompetitor) {
    return (
      <RegistrationSuccess
        competitor={registeredCompetitor}
        onRegisterAnother={handleRegisterAnother}
      />
    );
  }

  const submitDisabled =
    mutation.isPending ||
    availabilityQuery.isFetching ||
    availabilityQuery.data === false;

  return (
    <Container maxWidth="md" sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register for Cubuzzle S4
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter competitor details and choose the events for this competition.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Card sx={styles.card}>
          <CardHeader
            avatar={<HowToRegIcon color="action" />}
            title="Competitor details"
            titleTypographyProps={{ variant: "h6" }}
          />
          <CardContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Box sx={styles.photoRow}>
                  <Avatar
                    src={photoPreview}
                    alt={values.name}
                    sx={styles.avatar}
                    variant="rounded"
                  />
                  <Box>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload photo
                      <Box
                        component="input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        sx={styles.hiddenInput}
                        onChange={handlePhotoChange}
                      />
                    </Button>
                    <Typography
                      variant="body2"
                      color={imageError ? "error" : "text.secondary"}
                      sx={{ mt: 1 }}
                    >
                      {imageError ||
                        (photo
                          ? photo.name
                          : "Optional JPEG, PNG, or WebP up to 5 MB")}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cubuzzle ID"
                  value={values.userId}
                  onChange={handleTextChange("userId")}
                  onBlur={handleBlur("userId")}
                  error={
                    fieldHasError("userId", errors, touched) ||
                    userIdAvailability?.severity === "error"
                  }
                  helperText={
                    fieldHasError("userId", errors, touched)
                      ? errors.userId
                      : userIdAvailability?.message || " "
                  }
                  fullWidth
                  required
                  inputProps={{ maxLength: 20 }}
                  InputProps={{
                    endAdornment: userIdAvailability && (
                      <InputAdornment position="end">
                        {userIdAvailability.severity === "info" && (
                          <CircularProgress size={18} />
                        )}
                        {userIdAvailability.severity === "success" && (
                          <CheckCircleIcon color="success" fontSize="small" />
                        )}
                        {userIdAvailability.severity === "error" && (
                          <ErrorOutlineIcon color="error" fontSize="small" />
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  value={values.name}
                  onChange={handleTextChange("name")}
                  onBlur={handleBlur("name")}
                  error={fieldHasError("name", errors, touched)}
                  helperText={
                    fieldHasError("name", errors, touched) ? errors.name : " "
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={handleTextChange("email")}
                  onBlur={handleBlur("email")}
                  error={fieldHasError("email", errors, touched)}
                  helperText={
                    fieldHasError("email", errors, touched) ? errors.email : " "
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={values.phoneNo}
                  onChange={handleTextChange("phoneNo")}
                  onBlur={handleBlur("phoneNo")}
                  error={fieldHasError("phoneNo", errors, touched)}
                  helperText={
                    fieldHasError("phoneNo", errors, touched)
                      ? errors.phoneNo
                      : " "
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Gender"
                  value={values.gender}
                  onChange={handleTextChange("gender")}
                  onBlur={handleBlur("gender")}
                  error={fieldHasError("gender", errors, touched)}
                  helperText={
                    fieldHasError("gender", errors, touched)
                      ? errors.gender
                      : " "
                  }
                  fullWidth
                  required
                >
                  {GENDERS.map((gender) => (
                    <MenuItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={COUNTRIES}
                  value={values.country}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.code === value.code
                  }
                  onChange={(_, country) => setFieldValue("country", country)}
                  onBlur={handleBlur("country")}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      {...props}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <FlagIcon code={option.code.toLowerCase()} />
                      {option.name}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country"
                      required
                      error={fieldHasError("country", errors, touched)}
                      helperText={
                        fieldHasError("country", errors, touched)
                          ? errors.country
                          : " "
                      }
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: values.country && (
                          <InputAdornment position="start">
                            <FlagIcon
                              code={values.country.code.toLowerCase()}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="School"
                  value={values.school}
                  onChange={handleTextChange("school")}
                  onBlur={handleBlur("school")}
                  error={fieldHasError("school", errors, touched)}
                  helperText={
                    fieldHasError("school", errors, touched)
                      ? errors.school
                      : " "
                  }
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={styles.card}>
          <CardHeader
            title="Competition details"
            titleTypographyProps={{ variant: "h6" }}
          />
          <CardContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Category"
                  value={values.category}
                  onChange={handleTextChange("category")}
                  onBlur={handleBlur("category")}
                  error={fieldHasError("category", errors, touched)}
                  helperText={
                    fieldHasError("category", errors, touched)
                      ? errors.category
                      : " "
                  }
                  fullWidth
                  required
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Division"
                  value={values.registeredDivision}
                  onChange={handleTextChange("registeredDivision")}
                  onBlur={handleBlur("registeredDivision")}
                  error={fieldHasError("registeredDivision", errors, touched)}
                  helperText={
                    fieldHasError("registeredDivision", errors, touched)
                      ? errors.registeredDivision
                      : values.registeredDivision
                        ? DIVISIONS.find(
                            (division) =>
                              division.value === values.registeredDivision,
                          )?.hint
                        : " "
                  }
                  fullWidth
                  required
                >
                  {DIVISIONS.map((division) => (
                    <MenuItem key={division.value} value={division.value}>
                      {division.label} - {division.hint}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Mode"
                  value={values.modeOfParticipation}
                  onChange={handleTextChange("modeOfParticipation")}
                  onBlur={handleBlur("modeOfParticipation")}
                  error={fieldHasError("modeOfParticipation", errors, touched)}
                  helperText={
                    fieldHasError("modeOfParticipation", errors, touched)
                      ? errors.modeOfParticipation
                      : " "
                  }
                  fullWidth
                  required
                >
                  {MODES.map((mode) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  component="fieldset"
                  required
                  error={fieldHasError("events", errors, touched)}
                  fullWidth
                >
                  <FormLabel component="legend">Events</FormLabel>
                  <FormGroup sx={styles.eventGrid}>
                    {REGISTRATION_EVENTS.map((event) => (
                      <FormControlLabel
                        key={event.id}
                        sx={styles.eventOption}
                        control={
                          <Checkbox
                            checked={values.events.includes(event.id)}
                            onChange={() => handleEventToggle(event.id)}
                          />
                        }
                        label={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <CubingIcon eventId={event.id} small />
                            <Typography variant="body2">
                              {event.label}
                            </Typography>
                          </Stack>
                        }
                      />
                    ))}
                  </FormGroup>
                  <FormHelperText>
                    {fieldHasError("events", errors, touched)
                      ? errors.events
                      : " "}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {availabilityQuery.isError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Cubuzzle ID availability could not be checked right now. The final
            submit will still verify it.
          </Alert>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} sx={styles.actions}>
          <Typography variant="body2" color="text.secondary">
            {values.registeredDivision
              ? `Selected division: ${optionLabel(DIVISIONS, values.registeredDivision)}`
              : "Choose your division and events before submitting."}
          </Typography>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<HowToRegIcon />}
            disabled={submitDisabled}
          >
            {mutation.isPending ? "Registering..." : "Register"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

export default Register;
