import { useQuery } from "@tanstack/react-query";
import { getPreviousDivision } from "../../lib/firebase/firestore";
import { COMPETITION_ID } from "./constants";

// Looks up the competitor's most recent 3x3 division from past competitions.
// `getPreviousDivision` never throws (it logs and resolves to null), so a
// lookup failure is treated the same as "no previous division found" and the
// caller falls back to showing the division picker.
function usePreviousDivision({ userId, enabled }) {
  const {
    data: division,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ["previous-division", userId],
    queryFn: () => getPreviousDivision(userId, { excludeCompetitionId: COMPETITION_ID }),
    enabled: Boolean(enabled && userId),
    staleTime: 60_000,
  });

  const isResolved = !enabled || isFetched;

  return {
    division: division ?? null,
    isLoading: Boolean(enabled) && isLoading,
    isResolved,
  };
}

export default usePreviousDivision;
