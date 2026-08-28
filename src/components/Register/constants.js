import { DEFAULT_COUNTRY_CODE, getCountryByCode } from "../../lib/countries";

export const COMPETITION_ID = "cubuzzle-s5";

export const INITIAL_VALUES = {
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
  termsConsent: false,
};
