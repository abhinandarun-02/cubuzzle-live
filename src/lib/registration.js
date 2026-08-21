import { getEventDisplayName } from "./competition";

export const REGISTRATION_EVENTS = [
  "222",
  "333",
  "444",
  "555",
  "pyram",
  "skewb",
  "mirror",
  "minx",
  "333oh",
].map((id) => ({
  id,
  label: getEventDisplayName(id),
}));

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const CATEGORIES = [
  { value: "B-8", label: "Below 8" },
  { value: "8-12", label: "8 - 12" },
  { value: "A-13", label: "Above 13" },
];

export const MODES = [
  { value: "onsite", label: "Onsite" },
  { value: "online", label: "Online" },
];

export const DIVISIONS = [
  { value: "A+", label: "A+", hint: "Sub 10 seconds" },
  { value: "A", label: "A", hint: "10-19 seconds" },
  { value: "B", label: "B", hint: "20-29 seconds" },
  { value: "C", label: "C", hint: "30-45 seconds" },
  { value: "D", label: "D", hint: "45+ seconds" },
];

export const USER_ID_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,19}$/;

export const normalizeUserId = (userId) => userId.trim().toUpperCase();

const required = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined && String(value).trim() !== "";
};

export const validateRegistration = (values) => {
  const errors = {};
  const userId = normalizeUserId(values.userId);

  if (!required(userId)) {
    errors.userId = "Cubuzzle ID is required";
  } else if (!USER_ID_PATTERN.test(userId)) {
    errors.userId = "Use 3-20 letters, numbers, underscores, or hyphens";
  }

  // Validate previous participant info
  if (!required(values.isPreviousParticipant) && values.isPreviousParticipant !== false) {
    errors.isPreviousParticipant = "Please indicate if you are a previous participant";
  }

  // If previous participant, validate previous userId
  if (values.isPreviousParticipant === true) {
    const previousUserId = normalizeUserId(values.previousUserId || "");
    if (!required(previousUserId)) {
      errors.previousUserId = "Previous Cubuzzle ID is required";
    } else if (!USER_ID_PATTERN.test(previousUserId)) {
      errors.previousUserId = "Use 3-20 letters, numbers, underscores, or hyphens";
    }
  }

  if (!required(values.name)) {
    errors.name = "Name is required";
  }

  if (!required(values.email)) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email";
  }

  if (!required(values.phoneNo)) {
    errors.phoneNo = "Phone number is required";
  }

  if (!required(values.school)) {
    errors.school = "School is required";
  }

  if (!required(values.gender)) {
    errors.gender = "Gender is required";
  }

  if (!required(values.category)) {
    errors.category = "Category is required";
  }

  if (!required(values.registeredDivision)) {
    errors.registeredDivision = "Division is required";
  }

  if (!required(values.modeOfParticipation)) {
    errors.modeOfParticipation = "Mode is required";
  }

  if (!values.country?.code || !values.country?.name) {
    errors.country = "Country is required";
  }

  if (!required(values.events)) {
    errors.events = "Select at least one event";
  }

  return errors;
};

export const validateImageFile = (file) => {
  if (!file) {
    return null;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return "Upload a JPEG, PNG, or WebP image";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Image must be 5 MB or smaller";
  }

  return null;
};
