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
          mb: 2,
        }}
      >
        <Box
          component="img"
          src="/ccl-logo.png"
          alt="Cubuzzle Champion League"
          sx={{
            width: "100%",
            maxWidth: 128,
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
        size="small"
        color="primary"
        variant="outlined"
        sx={{ mb: 1.5, fontWeight: 600, letterSpacing: 0.2 }}
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
        Register for Cubuzzle
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 1, mb: 2.5, maxWidth: 520, mx: "auto" }}
      >
        A few details and you&apos;re on the board. Returning competitors can
        skip the basics with a Cubuzzle ID.
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        justifyContent="center"
      >
        <Chip
          size="small"
          icon={<PhotoCameraOutlinedIcon />}
          label="Competition photo"
          variant="outlined"
        />
        <Chip
          size="small"
          icon={<ConfirmationNumberOutlinedIcon />}
          label="Order ID (CBZL…)"
          variant="outlined"
        />
        <Chip
          size="small"
          icon={<BadgeOutlinedIcon />}
          label="Cubuzzle ID if returning"
          variant="outlined"
        />
      </Stack>
    </Box>
  );
}

export default RegisterHero;
