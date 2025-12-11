import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import { getCompetitorWithResults } from "../../lib/firebase/firestore";
import CompetitorResults from "./CompetitorResults";
import { Box } from "@mui/material";
import CompetitorInfo from "./CompetitorInfo";

export default function CompetitorPage() {
  const { competitorId } = useParams();

  const competitionId = "cubuzzle-s3"; // assumption: single competition id used elsewhere

  const { data, isLoading, isError } = useQuery({
    queryKey: ["competitor", competitionId, competitorId, "withResults"],
    queryFn: async () => getCompetitorWithResults(competitionId, competitorId),
  });

  if (isLoading) return <Loading />;
  if (isError) return <Error message="Failed to load competitor." />;

  const { competitor, results } = data;

  return (
    <Box>
      <CompetitorInfo competitor={competitor} />
      <CompetitorResults results={results} competitionId={competitionId} />
    </Box>
  );
}
