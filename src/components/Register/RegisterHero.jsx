import { Box, Chip, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function RegisterHero() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{ textAlign: "center", mb: { xs: 3, md: 4 }, pt: { xs: 0.5, md: 1 } }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src="/ccl-logo.png"
          alt="Cubuzzle Champion League"
          sx={{
            width: "100%",
            maxWidth: 192,
            height: "auto",
            display: "block",
            filter: "drop-shadow(0 8px 24px rgba(144, 202, 249, 0.22))",
          }}
        />
      </Box>
      <Chip
        label="Season 5 · Summer Championship 2026"
        size={isSmallScreen ? "small" : "medium"}
        color="primary"
        variant="outlined"
        sx={{
          mb: 1.5,
          fontWeight: 600,
          letterSpacing: 0.2,
          fontSize: { xs: "0.8125rem", sm: "1rem" },
          bgcolor: "rgba(5, 7, 12, 0.45)",
          backdropFilter: "blur(10px)",
        }}
      />
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 800,
          letterSpacing: -0.4,
          fontSize: { xs: "1.75rem", sm: "2.125rem" },
          textShadow: "0 8px 28px rgba(0, 0, 0, 0.45)",
        }}
      >
        Register for Cubuzzle Champion League
      </Typography>
    </Box>
  );
}

export default RegisterHero;
