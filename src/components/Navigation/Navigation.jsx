import { Routes, Route } from "react-router-dom";
import CompetitionNavigation from "../CompetitionNavigation/CompetitionNavigation";

function Navigation() {
  return (
    <Routes>
      <Route path="/*" element={<CompetitionNavigation />} />
    </Routes>
  );
}

export default Navigation;
