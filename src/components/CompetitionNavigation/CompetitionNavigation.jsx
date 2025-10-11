import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import CompetitionHome from "../CompetitionHome/CompetitionHome";
import Round from "../Round/Round";
import Competitors from "../Competitors/Competitors";
import Podiums from "../Podiums/Podiums";
import CompetitionLayout from "./CompetitionLayout";
import { competitionData } from "./data";

function CompetitionNavigation() {
  const { competitionId } = useParams();

  const { data } = competitionData;


  // Render the layout even if the competition is not loaded.
  // This improves UX and also starts loading data for the actual page (like CompetitionHome).
  const competition = data ? data.competition : null;

  return (
    <CompetitionLayout competition={competition}>

      {competition && (
        <Helmet>
          <title>{competition.shortName} - WCA Live</title>
        </Helmet>
      )}
      <Routes>
        <Route path="" element={<CompetitionHome />} />
        <Route path="rounds/:roundId/*" element={<Round />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="podiums" element={<Podiums />} />
        <Route path="*" element={<Navigate to={`/competitions/${competitionId}`} />} />
      </Routes>
    </CompetitionLayout>
  );
}

export default CompetitionNavigation;
