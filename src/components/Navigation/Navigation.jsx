import { Routes, Route } from "react-router-dom";
import DefaultNavigation from "../DefaultNavigation/DefaultNavigation";

function Navigation() {
  return (
    <Routes>
      <Route path="/*" element={<DefaultNavigation />} />
    </Routes>
  );
}

export default Navigation;
