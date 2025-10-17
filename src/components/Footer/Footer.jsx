import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 1.5,
        textAlign: "center",
        mt: "auto",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontSize: "0.7rem",
          opacity: 0.6,
          fontWeight: 400,
        }}
      >
        Powered by Hariology
      </Typography>
    </Box>
  );
}

export default Footer;