import { Box, Typography, Link } from "@mui/material";
import logo from "../DefaultNavigation/logo.png";
import yjLogo from "/yj-logo.png";

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
          fontSize: "0.65rem",
          opacity: 0.9,
          fontStyle: "italic",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
        }}
      >
        Gifts for participants and prizes for winners sponsored by
        <img
          src={yjLogo}
          alt="YJ logo"
          style={{
            height: "14px",
            width: "auto",
            marginLeft: "2px",
          }}
        />
      </Typography>
      <Box
        sx={{
          fontSize: "0.7rem",
          opacity: 0.8,
          fontWeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mt: 0.5,
        }}
      >
        <Link
          href="https://cubuzzle.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "text.secondary",
            textDecoration: "underline",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.7rem",
            cursor: "pointer",
            opacity: 0.8,
            "&:hover": {
              opacity: 1,
              textDecoration: "underline",
            },
          }}
        >
          <img
            src={logo}
            alt="cubuzzle logo"
            style={{
              height: "16px",
              width: "auto",
              opacity: 0.8,
            }}
          />
          cubuzzle.com
        </Link>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: "0.7rem",
            opacity: 0.8,
          }}
        >
          • Powered by Hariology
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
