import { differenceInYears, isFuture, isValid, parse } from "date-fns";
import { getEventDisplayName } from "./competition";
import { COUNTRIES, getCountryByCode } from "./countries";

export const REGISTRATION_EVENTS = [
  "222",
  "333",
  "pyram",
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

export const parseDob = (dob) => {
  if (!dob) return null;
  const date = parse(dob, "yyyy-MM-dd", new Date());
  return isValid(date) ? date : null;
};

export const getAgeFromDob = (dob) => {
  const date = parseDob(dob);
  if (!date) return null;
  return differenceInYears(new Date(), date);
};

export const getCategoryFromDob = (dob) => {
  const age = getAgeFromDob(dob);
  if (age === null || age < 0) return null;
  if (age < 8) return "B-8";
  if (age <= 12) return "8-12";
  return "A-13";
};

export const getCategoryLabel = (category) =>
  CATEGORIES.find((item) => item.value === category)?.label || category;

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

export const resolveCountry = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    const byCode = getCountryByCode(value);
    if (byCode) return byCode;

    const normalized = value.trim().toLowerCase();
    return (
      COUNTRIES.find((country) => country.name.toLowerCase() === normalized) ??
      null
    );
  }

  if (typeof value === "object") {
    const byCode = getCountryByCode(value.code);
    if (byCode) return byCode;

    if (value.name) {
      const normalized = String(value.name).trim().toLowerCase();
      return (
        COUNTRIES.find((country) => country.name.toLowerCase() === normalized) ??
        null
      );
    }
  }

  return null;
};

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

  if (!required(values.isPreviousParticipant) && values.isPreviousParticipant !== false) {
    errors.isPreviousParticipant = "Please indicate if you are a previous participant";
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

  if (!required(values.dob)) {
    errors.dob = "Date of birth is required";
  } else {
    const dobDate = parseDob(values.dob);
    if (!dobDate) {
      errors.dob = "Enter a valid date of birth";
    } else if (isFuture(dobDate)) {
      errors.dob = "Date of birth cannot be in the future";
    } else if (getAgeFromDob(values.dob) > 100) {
      errors.dob = "Enter a valid date of birth";
    } else if (getCategoryFromDob(values.dob) == null) {
      errors.dob = "Enter a valid date of birth";
    }
  }

  if (!required(values.orderId)) {
    errors.orderId = "Order ID is required";
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
