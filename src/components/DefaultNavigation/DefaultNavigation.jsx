import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../Home/Home";
import DefaultLayout from "./DefaultLayout";

// const CURRENT_USER_QUERY = gql`...`;

function DefaultNavigation() {
  // Static navigation, always show all routes
  return (
    <DefaultLayout currentUser={null} loaded={true}>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </DefaultLayout>
  );
}

export default DefaultNavigation;
