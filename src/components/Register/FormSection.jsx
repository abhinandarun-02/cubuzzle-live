import { Box, Card, CardContent, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

function FormSection({ id, step, title, description, children }) {
  return (
    <Card
      id={id}
      variant="outlined"
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: "hidden",
        scrollMarginTop: 96,
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.03)"
            : "background.paper",
        borderColor: "divider",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "none"
            : "0 10px 28px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Box
        sx={{
          height: 3,
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(
              theme.palette.primary.main,
              0,
            )} 100%)`,
        }}
      />
      <CardContent
        sx={{
          p: { xs: 2.25, sm: 3.5 },
          "&:last-child": { pb: { xs: 2.25, sm: 3.5 } },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1.75,
            mb: description ? 3 : 2.5,
            alignItems: "flex-start",
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: (theme) =>
                `0 8px 18px ${alpha(theme.palette.primary.main, 0.38)}`,
            }}
          >
            {step}
          </Box>
          <Box sx={{ minWidth: 0, pt: 0.2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

export default FormSection;
