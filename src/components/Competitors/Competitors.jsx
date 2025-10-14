import { useQuery } from "@tanstack/react-query";
import CompetitorList from "./CompetitorList";
import { useParams } from "react-router-dom";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import { getCompetitorsByCompetition } from "../../lib/firebase/firestore";

function Competitors() {
  const { competitionId } = useParams();

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

  return <CompetitorList competitors={competitors} competitionId={competitionId} />;
}

export default Competitors;
