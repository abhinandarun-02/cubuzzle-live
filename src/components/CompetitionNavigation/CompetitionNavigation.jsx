import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import CompetitionHome from "../CompetitionHome/CompetitionHome";
import Round from "../Round/Round";
import Competitors from "../Competitors/Competitors";
import Podiums from "../Podiums/Podiums";
import CompetitionLayout from "./CompetitionLayout";
// import { competitionData } from "./data";
import { useQuery } from "@tanstack/react-query";
import { getCompetitionDetailsById } from "../../lib/firebase/firestore";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";

function CompetitionNavigation() {
  const { competitionId } = useParams();

  // const { data } = competitionData;

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
        <Route path=":eventId/:roundId/*" element={<Round />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="podiums" element={<Podiums />} />
        <Route path="*" element={<Navigate to={`/competitions/${competitionId}`} />} />
      </Routes>
    </CompetitionLayout>
  );
}

export default CompetitionNavigation;
