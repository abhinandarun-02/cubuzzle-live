import { useQuery } from "@tanstack/react-query";
import CompetitorList from "./CompetitorList";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import { getCompetitorsByCompetition } from "../../lib/firebase/firestore";
import { COMPETITION_ID } from "../../config";

function Competitors() {
  const competitionId = COMPETITION_ID;

  const {
    data: competitors,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["competition", competitionId, "competitors"],
    queryFn: async () => getCompetitorsByCompetition(competitionId),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message="Failed to load competitors." />;
  }

  return <CompetitorList competitors={competitors} />;
}

export default Competitors;
