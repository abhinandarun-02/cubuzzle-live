import { Link as RouterLink } from "react-router-dom";
import { Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import useToggleTheme from "../ThemeProvider/useToggleTheme";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";


function CompetitionToolbar({ competition, onMenuClick }) {
  const theme = useTheme();
  const toggleTheme = useToggleTheme();

  return (
    <Toolbar>
      <IconButton
        color="inherit"
        sx={{
          ml: "-12px",
          mr: "20px",
          display: {
            lg: "none",
          },
        }}
        onClick={onMenuClick}
        aria-label="Menu"
        size="large"
      >
        <MenuIcon />
      </IconButton>
      <Typography
        variant="h6"
        color="inherit"
        sx={{
          flexGrow: 1,
          color: "inherit",
          textDecoration: "none",
        }}
        noWrap={true}
        component={RouterLink}
        to={`/competitions/${competition.id}`}
      >
        {competition.name}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />

      <IconButton size="small" onClick={toggleTheme} aria-label="Toggle theme">
        {theme.palette.mode === "dark" ? <EmojiObjectsIcon /> : <EmojiObjectsOutlinedIcon />}
      </IconButton>
    </Toolbar>
  );
}

export default CompetitionToolbar;
