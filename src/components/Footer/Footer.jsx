import { Box, Typography, Link, alpha } from "@mui/material";
import logo from "../DefaultNavigation/logo.png";
import yjLogo from "/yj-logo.png";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2.5,
        px: 2,
        textAlign: "center",
        mt: "auto",
        borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.2)} 0%, transparent 100%)`
            : `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.02)} 0%, transparent 100%)`,
      }}
    >
      {/* Sponsor Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.75,
          mb: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: "0.7rem",
            opacity: 0.75,
            fontStyle: "italic",
          }}
        >
          Gifts for participants and prizes for winners sponsored by
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            py: 0.25,
            borderRadius: 1,
           
          }}
        >
          <img
            src={yjLogo}
            alt="YJ logo"
            style={{
              height: "16px",
              width: "auto",
            }}
          />
        </Box>
      </Box>

      {/* Credits Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="https://cubuzzle.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            fontSize: "0.75rem",
            fontWeight: 500,
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.08),
              color: "text.primary",
              transform: "translateY(-1px)",
            },
          }}
        >
          <img
            src={logo}
            alt="cubuzzle logo"
            style={{
              height: "18px",
              width: "auto",
            }}
          />
          cubuzzle.com
        </Link>

        <Typography
          component="span"
          sx={{
            fontSize: "0.7rem",
            color: "text.disabled",
          }}
        >
          •
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontSize: "0.72rem",
            color: "text.secondary",
            opacity: 0.8,
            fontWeight: 400,
          }}
        >
          Powered by{" "}
          <Box
            component="span"
            sx={{
              fontWeight: 600,
              opacity: 1,
            }}
          >
            Hariology
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
