import { Routes, Route, Navigate } from "react-router-dom";
import DefaultLayout from "./DefaultLayout";
import CompetitionHome from "../CompetitionHome/CompetitionHome";

function DefaultNavigation() {
  return (
    <DefaultLayout currentUser={null} loaded={true}>
      <Routes>
        <Route path="" element={<CompetitionHome />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </DefaultLayout>
  );
}

export default DefaultNavigation;
