import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";

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

export const getParticipantsByCompetition = async (competitionId) => {
  try {
    const participantsRef = collection(db, "competitions", competitionId, "participants");
    const q = query(participantsRef);
    const participantsSnapshot = await getDocs(q);
    const participants = participantsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return participants;
  } catch (error) {
    console.error("Error getting all participants: ", error);
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
