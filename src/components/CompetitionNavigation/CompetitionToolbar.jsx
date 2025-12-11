import { Link as RouterLink } from "react-router-dom";
import { Box, IconButton, Toolbar, Typography, alpha } from "@mui/material";
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
        bgcolor:
          theme.palette.mode === "light"
            ? "background.paper"
            : alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(8px)",
        borderBottom: (theme) =>
          `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        minHeight: { xs: 56, sm: 64 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <IconButton
        sx={{
          mr: 1,
          display: {
            lg: "none",
          },
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.08),
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
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          textDecoration: "none",
          mr: { xs: 1.5, sm: 2 },
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        <img
          src="/ccl-logo.png"
          alt="CCL Logo"
          style={{
            height: "36px",
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
          fontSize: { xs: "0.95rem", sm: "1.15rem", md: "1.35rem" },
          fontWeight: 600,
          letterSpacing: "-0.01em",
          transition: "color 0.2s ease-in-out",
          "&:hover": {
            color: theme.palette.text.secondary,
          },
        }}
        noWrap={true}
        component={RouterLink}
        to="/"
      >
        {competition.name}
      </Typography>

      <IconButton
        size="medium"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        sx={{
          ml: 1,
          p: 1,
          borderRadius: 2,
          transition: "all 0.2s ease-in-out",
          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
          "&:hover": {
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.1),
          },
        }}
      >
        {theme.palette.mode === "dark" ? (
          <EmojiObjectsIcon sx={{ fontSize: "1.3rem" }} />
        ) : (
          <EmojiObjectsOutlinedIcon sx={{ fontSize: "1.3rem" }} />
        )}
      </IconButton>
    </Toolbar>
  );
}

export default CompetitionToolbar;
