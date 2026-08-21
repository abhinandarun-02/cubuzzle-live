import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../Register/Register";

function DefaultNavigation() {
  return (
    <Routes>
      <Route path="" element={<Register />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default DefaultNavigation;
