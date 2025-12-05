import { db } from "./firebase";
import { collection, collectionGroup, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";

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
      })
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
    const competitorsRef = collection(db, "competitions", competitionId, "competitors");
    const q = query(competitorsRef);
    const competitorsSnapshot = await getDocs(q);
    const competitors = competitorsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return competitors;
  } catch (error) {
    console.error("Error getting all competitors: ", error);
    throw error;
  }
};

// Fetch competitor document and all results across events/rounds for that competitor
export const getCompetitorWithResults = async (competitionId, competitorId) => {

  try {
    // Use collectionGroup to fetch all result documents matching the competitorId across all competitions
    const resultsGroupRef = collectionGroup(db, "results");
    const resultsQuery = query(
      resultsGroupRef,
      where("id", "==", competitorId),
      where("scored", "==", true)
    );
    const resSnap = await getDocs(resultsQuery);

    // If no results, throw error
    if (resSnap.empty) {
      throw new Error("Competitor not found in any competition");
    }

   
// competitor document
    const competitorRef = doc(db, "users", competitorId);
    const competitorSnap = await getDoc(competitorRef);
    if (!competitorSnap.exists()) {
      throw new Error("Competitor not found");
    }
    const competitor = { id: competitorSnap.id, ...competitorSnap.data() };


    // Map results and attach eventId
    const results = resSnap.docs.map((r) => {
      let eventId = null;
      try {
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
    const events = Array.from(new Set(results.map((res) => res.eventId).filter(Boolean)));

    // Return all competitor docs and results
    return { competitor, events, results };
  } catch (error) {
    console.error("Error getting competitor with results: ", error);
    throw error;
  }
};

export const getRoundResults = async (competitionId, eventId, roundId, roundQuery) => {
  try {
    const roundRef = doc(db, "competitions", competitionId, "events", eventId, "rounds", roundId);
    const roundSnap = await getDoc(roundRef);
    if (!roundSnap.exists()) {
      throw new Error("Round not found");
    }
    const roundData = roundSnap.data();

    const resultsRef = collection(db, "competitions", competitionId, "events", eventId, "rounds", roundId, "results");
    // filter only scored results if specified
    let q = query(resultsRef, orderBy("ranking", "asc"));
    if (roundQuery?.scored) {
      q = query(resultsRef, where("scored", "==", true), orderBy("ranking", "asc"));
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

export const getUnifiedLeaderboard = async () => {
  try {
    const leaderboardRef = collection(db, "leaderboards", "333", "competitors");
    const q = query(leaderboardRef, orderBy("leaderboardRanking", "asc"));
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardEntries = leaderboardSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return leaderboardEntries;
  } catch (error) {
    console.error("Error getting unified leaderboard: ", error);
    throw error;
  }
};
