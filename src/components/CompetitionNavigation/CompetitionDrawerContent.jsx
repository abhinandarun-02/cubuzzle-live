import { Link as RouterLink } from "react-router-dom";
import { Divider, IconButton, Toolbar, Tooltip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CompetitionEventList from "./CompetitionEventList";

function CompetitionDrawerContent({ competition }) {
  return (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 1,
          gap: 1,
        }}
      >
        <Tooltip title="Home" arrow enterDelay={800} enterNextDelay={800}>
          <IconButton
            component={RouterLink}
            to="/"
            aria-label="Home"
            size="large"
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          title="Competitors"
          arrow
          enterDelay={800}
          enterNextDelay={800}
        >
          <IconButton
            component={RouterLink}
            to="/competitors"
            aria-label="Competitors"
            size="large"
          >
            <PeopleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Register" arrow enterDelay={800} enterNextDelay={800}>
          <IconButton
            component={RouterLink}
            to="/register"
            aria-label="Register"
            size="large"
          >
            <HowToRegIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Divider />
      <CompetitionEventList competitionEvents={competition.competitionEvents} />
    </>
  );
}

export default CompetitionDrawerContent;
