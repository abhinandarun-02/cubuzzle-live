import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../Home/Home";
import DefaultLayout from "./DefaultLayout";

function DefaultNavigation() {
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
