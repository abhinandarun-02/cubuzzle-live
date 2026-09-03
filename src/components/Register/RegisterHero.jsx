import { Box, Chip, Stack, Typography } from "@mui/material";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

function RegisterHero() {
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
            filter: (theme) =>
              theme.palette.mode === "dark"
                ? "drop-shadow(0 8px 24px rgba(144, 202, 249, 0.18))"
                : "drop-shadow(0 8px 18px rgba(25, 118, 210, 0.18))",
          }}
        />
      </Box>
      <Chip
        label="Season 5 · Summer Championship 2026"
        size="medium"
        color="primary"
        variant="outlined"
        sx={{ mb: 1.5, fontWeight: 600, letterSpacing: 0.2, fontSize: "1.10rem" }}
      />
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 800,
          letterSpacing: -0.4,
          fontSize: { xs: "1.75rem", sm: "2.125rem" },
        }}
      >
        Register for Cubuzzle Champion League
      </Typography>
    </Box>
  );
}

export default RegisterHero;
