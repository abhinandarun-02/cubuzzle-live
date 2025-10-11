import { Routes, Route } from "react-router-dom";
import CompetitionNavigation from "../CompetitionNavigation/CompetitionNavigation";
import DefaultNavigation from "../DefaultNavigation/DefaultNavigation";

function Navigation() {
  return (
    <Routes>
      <Route
        path="/competitions/:competitionId/*"
        element={<CompetitionNavigation />}
      />
      <Route path="/*" element={<DefaultNavigation />} />
    </Routes>
  );
}

export default Navigation;
