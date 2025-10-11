import { Link as RouterLink } from "react-router-dom";
import { Box, Grid, Toolbar, Typography, IconButton } from "@mui/material";
import logo from "./logo.svg";
import { useTheme } from "@mui/material/styles";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import useToggleTheme from "../ThemeProvider/useToggleTheme";

function DefaultLayout({ children }) {
  const theme = useTheme();
  const toggleTheme = useToggleTheme();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <img src={logo} alt="cubuzzle logo" height="40" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                Cubuzzle Live
              </Typography>
            </Box>
          </Grid>
          <Grid item sx={{ flexGrow: 1 }} />

          <Grid item>
            <IconButton size="small" onClick={toggleTheme} aria-label="Toggle theme">
              {theme.palette.mode === "dark" ? <EmojiObjectsIcon /> : <EmojiObjectsOutlinedIcon />}
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
}

export default DefaultLayout;
