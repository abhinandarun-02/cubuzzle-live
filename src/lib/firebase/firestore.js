import { db } from "./firebase";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

export const getAllCompetitions = async () => {
  try {
    const competitionsRef = collection(db, "competitions");
    const competitionsSnapshot = await getDocs(competitionsRef);
    const competitions = competitionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return competitions;
  } catch (error) {
    console.error("Error getting all competitions: ", error);
    throw error;
  }
};

export const getCompetitionById = async (competitionId) => {
  try {
    const competitionRef = doc(db, "competitions", competitionId);
    const competitionSnapshot = await getDoc(competitionRef);
    if (!competitionSnapshot.exists()) {
      throw new Error("Competition not found");
    }
    return { id: competitionSnapshot.id, ...competitionSnapshot.data() };
  } catch (error) {
    console.error("Error getting competition by ID: ", error);
    throw error;
  }
};

export const getCompetitionDetailsById = async (competitionId) => {
  try {
    const compRef = doc(db, "competitions", competitionId);
    const compSnap = await getDoc(compRef);

    if (!compSnap.exists()) {
      throw new Error("Competition not found");
    }

    const compData = compSnap.data();

    // fetch events for this competition
    const eventsSnap = await getDocs(collection(compRef, "events"));
    const events = await Promise.all(
      eventsSnap.docs.map(async (eventDoc) => {
        const eventData = eventDoc.data();

        // fetch rounds for this event
        const roundsSnap = await getDocs(collection(eventDoc.ref, "rounds"));
        const rounds = roundsSnap.docs.map((roundDoc) => ({
          id: roundDoc.id,
          ...roundDoc.data(),
        }));

        return {
          id: eventDoc.id,
          ...eventData,
          rounds,
        };
      }),
    );

    const competitionDetails = {
      id: compSnap.id,
      ...compData,
      competitionEvents: events,
    };

    return competitionDetails;
  } catch (error) {
    console.error("Error getting competition details by ID: ", error);
    throw error;
  }
};

export const getCompetitorsByCompetition = async (competitionId) => {
  try {
    const competitorsRef = collection(
      db,
      "competitions",
      competitionId,
      "competitors",
    );
    const q = query(competitorsRef);
    const competitorsSnapshot = await getDocs(q);
    const competitors = competitorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return competitors;
  } catch (error) {
    console.error("Error getting all competitors: ", error);
    throw error;
  }
};

export const createCompetitorId = (competitionId) =>
  doc(collection(db, "competitions", competitionId, "competitors")).id;

export const isCompetitorIdAvailable = async (competitionId, id) => {
  try {
    const competitorRef = doc(
      db,
      "competitions",
      competitionId,
      "competitors",
      id,
    );
    const competitorSnapshot = await getDoc(competitorRef);
    return !competitorSnapshot.exists();
  } catch (error) {
    console.error("Error checking competitor ID availability: ", error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
  } catch (error) {
    console.error("Error getting user profile: ", error);
    throw error;
  }
};

export const registerCompetitor = async (competitionId, competitor) => {
  try {
    const competitorRef = doc(
      db,
      "competitions",
      competitionId,
      "competitors",
      competitor.id,
    );

    await runTransaction(db, async (transaction) => {
      const competitorSnapshot = await transaction.get(competitorRef);

      if (competitorSnapshot.exists()) {
        const error = new Error("Competitor ID already registered");
        error.code = "competitor-id-taken";
        throw error;
      }

      transaction.set(competitorRef, {
        ...competitor,
        createdAt: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error("Error registering competitor: ", error);
    throw error;
  }
};

// Fetch competitor document and all results across events/rounds for that competitor
export const getCompetitorWithResults = async (competitionId, competitorId) => {
  try {
    // competitor document
    const competitorRef = doc(
      db,
      "competitions",
      competitionId,
      "competitors",
      competitorId,
    );
    const competitorSnap = await getDoc(competitorRef);
    if (!competitorSnap.exists()) {
      throw new Error("Competitor not found");
    }
    const competitor = { id: competitorSnap.id, ...competitorSnap.data() };

    // Use collectionGroup to fetch all result documents matching the competitorId
    const resultsGroupRef = collectionGroup(db, "results");
    const resultsQuery = query(
      resultsGroupRef,
      where("id", "==", competitorId),
      where("scored", "==", true),
      where("compId", "==", competitionId),
    );
    const resSnap = await getDocs(resultsQuery);

    const results = resSnap.docs.map((r) => {
      // Attempt to retrieve eventId from parent chain: .../events/{eventId}/rounds/{roundId}/results/{resultId}
      let eventId = null;
      try {
        // r.ref -> results doc
        // r.ref.parent -> results collection
        // r.ref.parent.parent -> round doc
        // r.ref.parent.parent.parent.parent -> event doc
        const maybeEventDoc = r.ref.parent?.parent?.parent?.parent;
        if (maybeEventDoc?.id) {
          eventId = maybeEventDoc.id;
        }
      } catch (e) {
        // ignore if structure unexpected
      }

      return { id: r.id, eventId, ...r.data() };
    });

    // Attach a deduplicated list of eventIds the competitor appears in
    const events = Array.from(
      new Set(results.map((res) => res.eventId).filter(Boolean)),
    );
    const competitorWithEvents = { ...competitor, events };

    return { competitor: competitorWithEvents, results };
  } catch (error) {
    console.error("Error getting competitor with results: ", error);
    throw error;
  }
};

export const getRoundResults = async (
  competitionId,
  eventId,
  roundId,
  roundQuery,
) => {
  try {
    const roundRef = doc(
      db,
      "competitions",
      competitionId,
      "events",
      eventId,
      "rounds",
      roundId,
    );
    const roundSnap = await getDoc(roundRef);
    if (!roundSnap.exists()) {
      throw new Error("Round not found");
    }
    const roundData = roundSnap.data();

    const resultsRef = collection(
      db,
      "competitions",
      competitionId,
      "events",
      eventId,
      "rounds",
      roundId,
      "results",
    );
    // filter only scored results if specified
    let q = query(resultsRef, orderBy("ranking", "asc"));
    if (roundQuery?.scored) {
      q = query(
        resultsRef,
        where("scored", "==", true),
        orderBy("ranking", "asc"),
      );
    }
    if (roundQuery?.advanced) {
      q = query(resultsRef, where("advancing", "==", true));
    }

    const resultsSnapshot = await getDocs(q);
    const results = resultsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const roundWithResults = {
      ...roundData,
      results,
    };

    return roundWithResults;
  } catch (error) {
    console.error("Error getting round results: ", error);
    throw error;
  }
};

export const getEventLeaderboard = async (competitionId, eventId) => {
  try {
    const eventRef = doc(db, "competitions", competitionId, "events", eventId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) {
      throw new Error("Event not found");
    }

    const roundsSnap = await getDocs(collection(eventRef, "rounds"));
    const rounds = roundsSnap.docs.map((roundDoc) => ({
      id: roundDoc.id,
      ...roundDoc.data(),
    }));

    const leaderboardRef = collection(
      db,
      "competitions",
      competitionId,
      "events",
      eventId,
      "leaderboard",
    );
    const leaderboardSnap = await getDocs(leaderboardRef);
    const leaderboard = leaderboardSnap.docs.map((leaderboardDoc) => ({
      id: leaderboardDoc.id,
      ...leaderboardDoc.data(),
    }));

    return {
      id: eventSnap.id,
      ...eventSnap.data(),
      rounds,
      leaderboard,
    };
  } catch (error) {
    console.error("Error getting event leaderboard: ", error);
    throw error;
  }
};
