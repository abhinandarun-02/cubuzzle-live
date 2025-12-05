import { AppBar, Box } from "@mui/material";
import CompetitionToolbar from "./CompetitionToolbar";
import Footer from "../Footer/Footer";

function CompetitionLayout({ children }) {
  return (
    <>
      <AppBar position="sticky">
        <CompetitionToolbar />
      </AppBar>
      <Box
        sx={{
          position: "relative",
          overflowY: "auto",
          py: { xs: 2, md: 3 },
          px: { xs: 1, md: 3 },
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
        <Footer />
      </Box>
    </>
  );
}

export default CompetitionLayout;
