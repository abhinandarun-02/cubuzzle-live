import { Routes, Route, Navigate } from "react-router-dom";
import Leaderboard from "../Leaderboard/Leaderboard";

import CompetitionLayout from "./CompetitionLayout";
import CompetitorPage from "../Competitor/CompetitorPage";

function CompetitionNavigation() {
  return (
    <CompetitionLayout>
      <Routes>
        <Route path="" element={<Leaderboard />} />
        <Route path="competitor/:competitorId" element={<CompetitorPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </CompetitionLayout>
  );
}

export default CompetitionNavigation;
