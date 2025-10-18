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
    <Toolbar
      sx={{
        bgcolor: theme.palette.mode === "light" ? "background.paper" : "transparent",
      }}
    >
      <IconButton
    
        sx={{
          ml: "-12px",
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
      <Box
        component={RouterLink}
        to="/"
        sx={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          mr: 1,
        }}
      >
        <img
          src="/ccl-logo.png"
          alt="CCL Logo"
          style={{
            height: "40px",
            display: "block",
          }}
        />
      </Box>
      <Typography

        color="inherit"
        sx={{
          flexGrow: 1,
          textDecoration: "none",
          color: theme.palette.text.primary,
          fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
          fontWeight: 500,
        }}
        noWrap={true}
        component={RouterLink}
        to="/"
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
