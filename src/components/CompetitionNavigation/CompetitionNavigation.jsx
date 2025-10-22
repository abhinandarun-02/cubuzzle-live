import { Routes, Route, Navigate } from "react-router-dom";
import CompetitionHome from "../CompetitionHome/CompetitionHome";
import Round from "../Round/Round";
import Competitors from "../Competitors/Competitors";

import CompetitionLayout from "./CompetitionLayout";
import CompetitorPage from "../Competitor/CompetitorPage";
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
      <Routes>
        <Route path="" element={<CompetitionHome />} />
        <Route path="events/:eventId/rounds/:roundId/*" element={<Round />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="competitor/:competitorId" element={<CompetitorPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </CompetitionLayout>
  );
}

export default CompetitionNavigation;
