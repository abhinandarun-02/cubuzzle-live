const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { buildUserId, USER_ID_PATTERN } = require("./userId");

const TEMP_PATH_PATTERN =
  /^temp\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i;
const COMPETITION_ID_PATTERN = /^[a-z0-9-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOB_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const ALLOWED_GENDERS = new Set(["male", "female", "other"]);
const ALLOWED_MODES = new Set(["onsite", "online"]);
const ALLOWED_DIVISIONS = new Set(["A+", "A", "B", "C", "D"]);
const ALLOWED_EVENTS = new Set(["222", "333", "pyram", "333oh"]);

const registerCompetitor = onCall(
  { cors: true, invoker: "public" },
  async (request) => {
    const data = request.data || {};
    const competitionId = data.competitionId;

    if (
      typeof competitionId !== "string" ||
      !COMPETITION_ID_PATTERN.test(competitionId)
    ) {
      throw new HttpsError("invalid-argument", "Invalid competition ID.");
    }

    if (data.isPreviousParticipant !== true && data.isPreviousParticipant !== false) {
      throw new HttpsError(
        "invalid-argument",
        "Indicate if you are a previous participant.",
      );
    }

    const isPreviousParticipant = data.isPreviousParticipant === true;
    const db = getFirestore();

    const competitionSnap = await db.doc(`competitions/${competitionId}`).get();
    if (!competitionSnap.exists) {
      throw new HttpsError("not-found", "Competition not found.");
    }

    const name = requireTrimmedString(data.name, "name", 200);
    const email = requireEmail(data.email);
    const phoneNo = requireTrimmedString(data.phoneNo, "phone number", 50);
    const school = requireTrimmedString(data.school, "school", 200);
    const gender = requireEnum(String(data.gender || "").toLowerCase(), ALLOWED_GENDERS, "gender");
    const dob = requireDob(data.dob);
    const category = getCategoryFromDob(dob);
    const orderId = requireTrimmedString(data.orderId, "order ID", 100);
    const modeOfParticipation = requireEnum(
      data.modeOfParticipation,
      ALLOWED_MODES,
      "mode of participation",
    );
    const country = requireCountry(data.country, "country");
    const nationality = requireCountry(data.nationality, "nationality");
    const events = requireEvents(data.events);
    const tempImagePath = optionalTempImagePath(data.tempImagePath);

    if (isPreviousParticipant) {
      return registerReturningCompetitor(db, {
        competitionId,
        userId: data.userId,
        name,
        email,
        phoneNo,
        school,
        gender,
        dob,
        category,
        orderId,
        registeredDivision: data.registeredDivision,
        modeOfParticipation,
        country,
        nationality,
        events,
        tempImagePath,
        imageUrl: data.imageUrl,
      });
    }

    const registeredDivision = requireEnum(
      data.registeredDivision,
      ALLOWED_DIVISIONS,
      "division",
    );

    if (!tempImagePath) {
      throw new HttpsError("invalid-argument", "Photo is required.");
    }

    return registerNewCompetitor(db, {
      competitionId,
      name,
      email,
      phoneNo,
      school,
      gender,
      dob,
      category,
      orderId,
      registeredDivision,
      modeOfParticipation,
      country,
      nationality,
      events,
      tempImagePath,
    });
  },
);

async function registerReturningCompetitor(db, input) {
  const userId = normalizeUserId(input.userId);
  if (!USER_ID_PATTERN.test(userId)) {
    throw new HttpsError("invalid-argument", "Invalid user ID.");
  }

  const imageUrl = optionalImageUrl(input.imageUrl);
  if (!input.tempImagePath && !imageUrl) {
    throw new HttpsError("invalid-argument", "Photo is required.");
  }

  const competitorRef = db.doc(
    `competitions/${input.competitionId}/competitors/${userId}`,
  );
  const userRef = db.doc(`users/${userId}`);

  const [userSnap, competitorSnap] = await Promise.all([
    userRef.get(),
    competitorRef.get(),
  ]);

  if (!userSnap.exists) {
    throw new HttpsError(
      "not-found",
      "No previous Cubuzzle profile found for this ID.",
    );
  }

  if (competitorSnap.exists) {
    throw new HttpsError("already-exists", "Competitor ID already registered.");
  }

  const previousDivision = await getPreviousDivision(
    db,
    userId,
    input.competitionId,
  );
  const registeredDivision = previousDivision
    ? previousDivision
    : requireEnum(input.registeredDivision, ALLOWED_DIVISIONS, "division");

  const competitor = buildCompetitorDocument({
    ...input,
    id: userId,
    registeredDivision,
    previousUserId: userId,
    imageUrl: input.tempImagePath ? null : imageUrl,
  });

  await competitorRef.set(competitorToWrite(competitor));
  logger.info("Registered returning competitor", {
    competitionId: input.competitionId,
    userId,
  });
  return competitor;
}

async function registerNewCompetitor(db, input) {
  const counterRef = db.doc("counters/userIdCounter");

  const competitor = await db.runTransaction(async (transaction) => {
    const counterSnap = await transaction.get(counterRef);

    if (!counterSnap.exists) {
      throw new HttpsError(
        "failed-precondition",
        "User ID counter is not initialized.",
      );
    }

    const lastSerial = counterSnap.data()?.lastSerial;
    if (
      typeof lastSerial !== "number" ||
      !Number.isInteger(lastSerial) ||
      lastSerial < 0
    ) {
      throw new HttpsError(
        "failed-precondition",
        "User ID counter has an invalid lastSerial value.",
      );
    }

    const next = lastSerial + 1;
    const userId = buildUserId({ name: input.name, serial: next });
    const competitorRef = db.doc(
      `competitions/${input.competitionId}/competitors/${userId}`,
    );
    const userRef = db.doc(`users/${userId}`);

    const [competitorSnap, userSnap] = await Promise.all([
      transaction.get(competitorRef),
      transaction.get(userRef),
    ]);

    if (competitorSnap.exists || userSnap.exists) {
      throw new HttpsError("already-exists", "Competitor ID already registered.");
    }

    const built = buildCompetitorDocument({
      ...input,
      id: userId,
      previousUserId: null,
      imageUrl: null,
    });

    transaction.update(counterRef, { lastSerial: next });
    transaction.set(competitorRef, competitorToWrite(built));
    transaction.set(userRef, {
      ...userProfileFromCompetitor(built),
      createdAt: FieldValue.serverTimestamp(),
    });

    return built;
  });

  logger.info("Registered new competitor", {
    competitionId: input.competitionId,
    userId: competitor.id,
  });
  return competitor;
}

function buildCompetitorDocument({
  id,
  name,
  email,
  phoneNo,
  school,
  gender,
  dob,
  category,
  orderId,
  registeredDivision,
  modeOfParticipation,
  country,
  nationality,
  events,
  previousUserId,
  tempImagePath,
  imageUrl,
}) {
  const competitor = {
    id,
    userId: id,
    name,
    email,
    phoneNo,
    school,
    gender,
    dob,
    category,
    orderId,
    registeredDivision,
    modeOfParticipation,
    country,
    nationality,
    events,
    previousUserId,
  };

  if (tempImagePath) {
    competitor.tempImagePath = tempImagePath;
  } else if (imageUrl) {
    competitor.imageUrl = imageUrl;
  }

  return competitor;
}

function competitorToWrite(competitor) {
  return {
    ...competitor,
    createdAt: FieldValue.serverTimestamp(),
  };
}

function userProfileFromCompetitor(competitor) {
  const profile = {
    name: competitor.name,
    email: competitor.email,
    phoneNo: competitor.phoneNo,
    school: competitor.school,
    gender: competitor.gender,
    dob: competitor.dob,
    country: competitor.country,
    nationality: competitor.nationality,
  };

  if (competitor.imageUrl) {
    profile.imageUrl = competitor.imageUrl;
  }

  return profile;
}

async function getPreviousDivision(db, userId, excludeCompetitionId) {
  const resultsSnapshot = await db
    .collectionGroup("results")
    .where("id", "==", userId)
    .where("scored", "==", true)
    .get();

  const previous3x3Results = resultsSnapshot.docs
    .map((resultDoc) => ({ id: resultDoc.id, ...resultDoc.data() }))
    .filter((result) => result.compId !== excludeCompetitionId)
    .filter((result) => result.eventId === "333")
    .filter((result) => result.calculatedDivision);

  if (previous3x3Results.length === 0) {
    return null;
  }

  previous3x3Results.sort(
    (a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt),
  );
  return previous3x3Results[0].calculatedDivision ?? null;
}

function createdAtMillis(createdAt) {
  if (!createdAt) return -Infinity;
  if (typeof createdAt.toMillis === "function") return createdAt.toMillis();
  if (typeof createdAt.seconds === "number") return createdAt.seconds * 1000;
  const parsed = Date.parse(createdAt);
  return Number.isNaN(parsed) ? -Infinity : parsed;
}

function requireTrimmedString(value, field, max) {
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", `Invalid ${field}.`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) {
    throw new HttpsError("invalid-argument", `Invalid ${field}.`);
  }
  return trimmed;
}

function requireEmail(value) {
  const email = requireTrimmedString(value, "email", 200);
  if (!EMAIL_PATTERN.test(email)) {
    throw new HttpsError("invalid-argument", "Invalid email.");
  }
  return email;
}

function requireEnum(value, allowed, field) {
  if (typeof value !== "string" || !allowed.has(value)) {
    throw new HttpsError("invalid-argument", `Invalid ${field}.`);
  }
  return value;
}

function requireDob(value) {
  if (typeof value !== "string" || !DOB_PATTERN.test(value)) {
    throw new HttpsError("invalid-argument", "Invalid date of birth.");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new HttpsError("invalid-argument", "Invalid date of birth.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    throw new HttpsError("invalid-argument", "Date of birth cannot be in the future.");
  }

  if (getCategoryFromDob(value) == null) {
    throw new HttpsError("invalid-argument", "Invalid date of birth.");
  }

  return value;
}

function getAgeFromDob(dob) {
  const [year, month, day] = dob.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }
  return age;
}

function getCategoryFromDob(dob) {
  const age = getAgeFromDob(dob);
  if (age < 0 || age > 100) return null;
  if (age < 8) return "B-8";
  if (age <= 12) return "8-12";
  return "A-13";
}

function requireCountry(value, field) {
  if (!value || typeof value !== "object") {
    throw new HttpsError("invalid-argument", `Invalid ${field}.`);
  }
  const code = requireTrimmedString(value.code, `${field} code`, 8).toUpperCase();
  const name = requireTrimmedString(value.name, `${field} name`, 100);
  return { code, name };
}

function requireEvents(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpsError("invalid-argument", "Select at least one event.");
  }

  const events = [];
  for (const eventId of value) {
    if (typeof eventId !== "string" || !ALLOWED_EVENTS.has(eventId)) {
      throw new HttpsError("invalid-argument", "Invalid event.");
    }
    if (!events.includes(eventId)) {
      events.push(eventId);
    }
  }

  return events;
}

function optionalTempImagePath(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !TEMP_PATH_PATTERN.test(value)) {
    throw new HttpsError("invalid-argument", "Invalid temp image path.");
  }
  return value;
}

function optionalImageUrl(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || value.length > 2000) {
    throw new HttpsError("invalid-argument", "Invalid image URL.");
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new HttpsError("invalid-argument", "Invalid image URL.");
    }
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("invalid-argument", "Invalid image URL.");
  }
  return value;
}

function normalizeUserId(userId) {
  if (typeof userId !== "string") {
    throw new HttpsError("invalid-argument", "Invalid user ID.");
  }
  return userId.trim().toUpperCase();
}

module.exports = { registerCompetitor };
