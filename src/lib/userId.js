const COMBINING_MARKS = /[\u0300-\u036f]/g;
const NON_LATIN_LETTERS = /[^A-Z]/g;

const lettersFromWord = (word) =>
  word
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toUpperCase()
    .replace(NON_LATIN_LETTERS, "");

export const getYearMonthParts = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return {
    yy: String(year).slice(-2).padStart(2, "0"),
    mm: String(month).padStart(2, "0"),
  };
};

export const deriveInitials = (name) => {
  if (name == null || String(name).trim() === "") {
    return "XX";
  }

  const words = String(name).trim().split(/\s+/);
  const usable = words
    .map(lettersFromWord)
    .filter((letters) => letters.length > 0);

  if (usable.length === 0) {
    return "XX";
  }

  if (usable.length === 1) {
    const letters = usable[0];
    return letters.length >= 2 ? letters.slice(0, 2) : `${letters}X`;
  }

  return `${usable[0][0]}${usable[usable.length - 1][0]}`;
};

export const formatSerial = (n) => String(n).padStart(3, "0");

export const buildUserId = ({ name, serial, date = new Date() }) => {
  const { yy, mm } = getYearMonthParts(date);
  return `${yy}${mm}${formatSerial(serial)}${deriveInitials(name)}`;
};
