import { differenceInYears, isFuture, isValid, parse } from "date-fns";
import { getEventDisplayName } from "./competition";
import { COUNTRIES, getCountryByCode } from "./countries";
import { USER_ID_PATTERN } from "./userId";

export { USER_ID_PATTERN };

export const REGISTRATION_EVENTS = [
  "222",
  "333",
  "444",
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
  {
    value: "A+",
    label: "Division A+",
    hint: "If your average solve is Sub 9.99",
  },
  {
    value: "A",
    label: "Division A",
    hint: "If your average solve is between 10 - 19.99 seconds",
  },
  {
    value: "B",
    label: "Division B",
    hint: "If your average solve is between 20 - 29.99 seconds",
  },
  {
    value: "C",
    label: "Division C",
    hint: "If your average solve is between 30 - 44.99 seconds",
  },
  {
    value: "D",
    label: "Division D",
    hint: "If your average solve is 45 seconds & above",
  },
];

// Fields filled from a returning participant's profile. Hidden while lookup is
// unresolved; locked (and masked, for confidential values) once supplied.
export const RETURNING_PROFILE_FIELDS = ["name", "email", "phoneNo", "gender"];

export const maskEmail = (email) => {
  if (!email) return "";
  const [user, domain] = String(email).split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(user.length - visible.length, 1))}@${domain}`;
};

export const maskPhone = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length <= 2) return String(phone);
  const visible = digits.slice(-2);
  return `${"*".repeat(digits.length - 2)}${visible}`;
};

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

export const ORDER_ID_PATTERN = /^CBZL/i;
const PHONE_ALLOWED_PATTERN = /^\+?[\d\s\-().]+$/;

const required = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined && String(value).trim() !== "";
};

export const isValidPhoneNumber = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!PHONE_ALLOWED_PATTERN.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

export const isValidOrderId = (value) =>
  ORDER_ID_PATTERN.test(String(value ?? "").trim());

export const validateRegistration = (values, { hiddenFields = [], skipDivision = false } = {}) => {
  const errors = {};
  const isHidden = (field) => hiddenFields.includes(field);

  if (!required(values.isPreviousParticipant) && values.isPreviousParticipant !== false) {
    errors.isPreviousParticipant = "Please indicate if you are a previous participant";
  }

  if (values.isPreviousParticipant === true) {
    const userId = normalizeUserId(values.userId || "");

    if (!required(userId)) {
      errors.userId = "Cubuzzle ID is required";
    } else if (!USER_ID_PATTERN.test(userId)) {
      errors.userId = "Use a Cubuzzle ID like 2410301AS";
    }
  }

  if (!isHidden("name") && !required(values.name)) {
    errors.name = "Name is required";
  }

  if (!isHidden("email")) {
    if (!required(values.email)) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = "Enter a valid email";
    }
  }

  if (!isHidden("phoneNo")) {
    if (!required(values.phoneNo)) {
      errors.phoneNo = "Phone number is required";
    } else if (!isValidPhoneNumber(values.phoneNo)) {
      errors.phoneNo = "Enter a valid phone number";
    }
  }

  if (!required(values.school)) {
    errors.school = "School is required";
  }

  if (!isHidden("gender") && !required(values.gender)) {
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
  } else if (!isValidOrderId(values.orderId)) {
    errors.orderId = "Order ID must start with CBZL";
  }

  if (!skipDivision && !required(values.registeredDivision)) {
    errors.registeredDivision = "Division is required";
  }

  if (!required(values.modeOfParticipation)) {
    errors.modeOfParticipation = "Mode is required";
  }

  if (!values.country?.code || !values.country?.name) {
    errors.country = "Country is required";
  }

  if (!values.nationality?.code || !values.nationality?.name) {
    errors.nationality = "Nationality is required";
  }

  if (!required(values.events)) {
    errors.events = "Select at least one event";
  }

  if (values.termsConsent !== true) {
    errors.termsConsent = "You must agree to the terms to register";
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
