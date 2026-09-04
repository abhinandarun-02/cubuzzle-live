const cubePattern = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="84" height="96" viewBox="0 0 84 96">
    <g fill="none" stroke="rgba(186,220,255,0.28)" stroke-width="1">
      <path d="M42 8 L74 26 L74 62 L42 80 L10 62 L10 26 Z"/>
      <path d="M42 8 L42 44"/>
      <path d="M10 26 L42 44 L74 26"/>
      <path d="M42 44 L42 80"/>
    </g>
  </svg>`,
);

export const styles = {
  pageShell: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 96px)",
    overflow: "hidden",
    bgcolor: "#05070c",
  },
  pageBackdrop: {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  pageBackdropImage: {
    width: "100%",
    height: "auto",
    maxHeight: "none",
    flexShrink: 0,
    objectFit: "contain",
    objectPosition: "center top",
    display: "block",
    position: "relative",
    zIndex: 1,
    WebkitMaskImage:
      "linear-gradient(to bottom, #000 0%, #000 55%, rgba(0,0,0,0.55) 78%, transparent 100%)",
    maskImage:
      "linear-gradient(to bottom, #000 0%, #000 55%, rgba(0,0,0,0.55) 78%, transparent 100%)",
  },
  pageBackdropImageLower: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    mt: { xs: "-88px", sm: "-128px", md: "-176px" },
    objectFit: "cover",
    objectPosition: "center top",
    display: "block",
    WebkitMaskImage:
      "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 18%, #000 36%, #000 100%)",
    maskImage:
      "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 18%, #000 36%, #000 100%)",
  },
  pageCubePattern: {
    position: "absolute",
    inset: 0,
    opacity: 0.12,
    backgroundImage: `url("data:image/svg+xml,${cubePattern}")`,
    backgroundSize: "84px 96px",
  },
  pageVignette: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(5, 7, 12, 0.1) 0%, rgba(5, 7, 12, 0.16) 24%, rgba(5, 7, 12, 0.28) 46%, rgba(5, 7, 12, 0.42) 100%)",
  },
  page: {
    position: "relative",
    py: { xs: 2, md: 4 },
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
    bgcolor: "rgba(10, 14, 22, 0.72)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
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
    bgcolor: "rgba(12, 16, 24, 0.72)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
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
