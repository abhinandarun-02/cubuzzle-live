import { Box, Typography, List, ListItem, ListItemText, ListItemButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const YOUNGEST_CUBERS = [
  { division: "Division A+", name: "Taehoon Yoo", wcaId: "2410001TY" },
  { division: "Division A", name: "Aarav Sujesh", wcaId: "2410007AS" },
  { division: "Division B", name: "Elyas Elmaizi", wcaId: "2510186EE" },
  { division: "Division C", name: "Faaris Kadu", wcaId: "2508125FK" },
  { division: "Division D", name: "Sulaiman Zeinelabdin", wcaId: "2509166SZ" },
  { division: "2x2 and Pyraminx", name: "Tanubhav Shiju", wcaId: "2510179TS" },
];

export default function YoungestCuber({ cubers = YOUNGEST_CUBERS }) {
  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        🏅
        <Typography variant="subtitle2" fontWeight="bold">
          Youngest Cubers
        </Typography>
      </Box>
      <List dense disablePadding>
        {cubers.map((cuber, index) => (
          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
            <ListItemButton component={RouterLink} to={`/competitor/${cuber.wcaId}`}>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="medium">
                    {cuber.division}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {cuber.name} ({cuber.wcaId})
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
