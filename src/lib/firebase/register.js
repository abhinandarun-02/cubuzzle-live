import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export const registerCompetitor = async (payload) => {
  const register = httpsCallable(functions, "registerCompetitor");
  const { data } = await register(payload);
  return data;
};
