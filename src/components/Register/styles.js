export const styles = {
  page: {
    position: "relative",
    pb: { xs: 2, md: 4 },
  },
  pageGlow: {
    pointerEvents: "none",
    position: "absolute",
    top: -96,
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(760px, 140%)",
    height: 320,
    zIndex: 0,
    background: (theme) =>
      theme.palette.mode === "dark"
        ? "radial-gradient(ellipse at center, rgba(144, 202, 249, 0.16) 0%, transparent 70%)"
        : "radial-gradient(ellipse at center, rgba(25, 118, 210, 0.14) 0%, transparent 70%)",
  },
  pageInner: {
    position: "relative",
    zIndex: 1,
  },
  form: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
  },
  stickyNav: {
    position: "sticky",
    top: -8,
    zIndex: 8,
    mb: 3,
    py: 1.25,
    px: { xs: 1.25, sm: 1.5 },
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    backdropFilter: "blur(14px)",
    bgcolor: (theme) =>
      theme.palette.mode === "dark"
        ? "rgba(18, 18, 18, 0.82)"
        : "rgba(255, 255, 255, 0.88)",
    boxShadow: (theme) =>
      theme.palette.mode === "dark"
        ? "0 10px 30px rgba(0, 0, 0, 0.35)"
        : "0 10px 30px rgba(15, 23, 42, 0.08)",
  },
  card: {
    mb: 3,
  },
  sectionTitle: {
    mb: 2,
    fontWeight: 700,
  },
  fieldLabel: {
    mb: 0.75,
    fontWeight: 600,
    color: "text.primary",
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
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontSize: 11,
  },
  iconTile: (selected) => ({
    width: 42,
    height: 42,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    bgcolor: (theme) =>
      selected
        ? theme.palette.mode === "dark"
          ? "rgba(144, 202, 249, 0.18)"
          : "rgba(25, 118, 210, 0.12)"
        : theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.06)"
          : "rgba(0, 0, 0, 0.04)",
    color: selected ? "primary.main" : "text.secondary",
  }),
  submitCard: {
    p: { xs: 2, sm: 2.5 },
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: (theme) =>
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.04)"
        : "background.paper",
    boxShadow: (theme) =>
      theme.palette.mode === "dark"
        ? "none"
        : "0 12px 32px rgba(15, 23, 42, 0.08)",
  },
  successContainer: {
    container: {
      py: 3,
    },
    cardContent: {
      p: { xs: 3, sm: 4.5 },
      textAlign: "center",
    },
    successIcon: {
      fontSize: 56,
      color: "success.main",
      mb: 1.5,
    },
    avatar: {
      mx: "auto",
      mb: 2,
      width: 104,
      height: 104,
      fontSize: "2.5rem",
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
