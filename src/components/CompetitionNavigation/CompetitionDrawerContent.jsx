import { Link as RouterLink } from "react-router-dom";
import { Divider, IconButton, Toolbar, Tooltip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CompetitionEventList from "./CompetitionEventList";
import YoungestCuber from "./YoungestCuber";

function CompetitionDrawerContent({ competition }) {
  return (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 1,
          gap: 1
        }}
      >
        <Tooltip title="Home" arrow enterDelay={800} enterNextDelay={800}>
          <IconButton component={RouterLink} to="/" aria-label="Home" size="large">
            <HomeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Competitors" arrow enterDelay={800} enterNextDelay={800}>
          <IconButton component={RouterLink} to="/competitors" aria-label="Competitor" size="large">
            <PeopleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Leaderboard" arrow enterDelay={800} enterNextDelay={800}>
          <IconButton component={RouterLink} to="/leaderboard" aria-label="Leaderboard" size="large">
            <EmojiEventsIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Divider />
      <CompetitionEventList competitionEvents={competition.competitionEvents} />
      <Divider sx={{ mt: 2 }} />
      <YoungestCuber />
    </>
  );
}

export default CompetitionDrawerContent;
