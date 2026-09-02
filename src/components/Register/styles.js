import { alpha } from "@mui/material/styles";
import { keyframes } from "@emotion/react";

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeInStyle = (delayMs = 0) => ({
  animation: `${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`,
  animationDelay: `${delayMs}ms`,
});

export const styles = {
  page: {
    py: { xs: 3, sm: 5 },
    pb: { xs: 14, sm: 16 },
  },
  hero: {
    position: "relative",
    textAlign: "center",
    mb: { xs: 3, sm: 4 },
    py: { xs: 4, sm: 5 },
    px: { xs: 2.5, sm: 4 },
    borderRadius: 5,
    overflow: "hidden",
    border: "1px solid",
    borderColor: "divider",
    background: (theme) =>
      theme.palette.mode === "dark"
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.32)} 0%, ${alpha(theme.palette.secondary.main, 0.16)} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mx: "auto",
    mb: 2,
    bgcolor: "primary.main",
    color: "primary.contrastText",
    boxShadow: (theme) => `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  heroTitle: {
    fontWeight: 700,
    mb: 1,
  },
  heroSubtitle: {
    maxWidth: 480,
    mx: "auto",
  },
  card: {
    mb: 3,
    borderRadius: 4,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "none",
    overflow: "hidden",
    transition: "box-shadow 0.25s ease, border-color 0.25s ease",
    "&:hover": {
      borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
      boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.4 : 0.08)}`,
    },
  },
  cardContent: {
    p: { xs: 2.5, sm: 3.5 },
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    mb: 2.5,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.1),
    color: "primary.main",
  },
  sectionTitle: {
    fontWeight: 600,
  },
  fieldLabel: {
    mb: 0.75,
    fontWeight: 500,
  },
  fieldHint: {
    mb: 1.5,
    display: "block",
  },
  sectionCaption: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: "text.secondary",
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontSize: 12,
  },
  termsBox: {
    display: "block",
    mb: 3,
    p: { xs: 2, sm: 2.5 },
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    transition: "border-color 0.2s ease",
  },
  termsBoxError: {
    borderColor: "error.main",
  },
  actionBarWrapper: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1150,
    display: "flex",
    justifyContent: "center",
    px: 2,
    pb: { xs: 2, sm: 3 },
    pointerEvents: "none",
  },
  actionBarInner: {
    pointerEvents: "auto",
    width: "100%",
    maxWidth: 640,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0.5,
    py: 1.75,
    px: 3,
    borderRadius: 5,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.94),
    backdropFilter: "blur(14px)",
    boxShadow: (theme) => `0 -8px 32px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.5 : 0.14)}`,
  },
  submitButton: {
    minWidth: 220,
    borderRadius: 3,
    fontWeight: 600,
  },
  successContainer: {
    container: {
      py: 3,
    },
    cardContent: {
      p: { xs: 3, sm: 4 },
      textAlign: "center",
    },
    successIconWrap: {
      width: 84,
      height: 84,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mx: "auto",
      mb: 2,
      bgcolor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.2 : 0.12),
      color: "success.main",
    },
    successIcon: {
      fontSize: 48,
    },
    avatar: {
      mx: "auto",
      mb: 2,
      width: 96,
      height: 96,
      fontSize: "2.5rem",
      border: "3px solid",
      borderColor: "background.paper",
      boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.common.black, 0.18)}`,
    },
    chipWrap: {
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 1,
      mt: 2,
    },
    actions: {
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 1.5,
      mt: 4,
    },
  },
};
