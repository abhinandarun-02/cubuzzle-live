import { Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import CompetitionHome from "../CompetitionHome/CompetitionHome";
import Round from "../Round/Round";
import Competitors from "../Competitors/Competitors";
import Podiums from "../Podiums/Podiums";
import CompetitionLayout from "./CompetitionLayout";
import { useQuery } from "@tanstack/react-query";
import { getCompetitionDetailsById } from "../../lib/firebase/firestore";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";

function CompetitionNavigation() {
  const competitionId = "cubuzzle2025";

  const {
    data: competition,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["competition", competitionId, "details"],
    queryFn: async () => getCompetitionDetailsById(competitionId),
  });

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <Error />;
  }

  return (
    <CompetitionLayout competition={competition}>
      {competition && (
        <Helmet>
          <title>{competition.name}</title>
        </Helmet>
      )}
      <Routes>
        <Route path="" element={<CompetitionHome />} />
        <Route path="events/:eventId/rounds/:roundId/*" element={<Round />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="podiums" element={<Podiums />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </CompetitionLayout>
  );
}

export default CompetitionNavigation;
