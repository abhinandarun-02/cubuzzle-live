import { Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PeopleIcon from "@mui/icons-material/People";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import CubingIcon from "../CubingIcon/CubingIcon";
import { getEventDisplayName } from "../../lib/competition";

const styles = {
  container: {
    py: 3,
  },
  cardContent: {
    p: { xs: 3, sm: 4 },
    textAlign: "center",
  },
  successIcon: {
    fontSize: 52,
    color: "success.main",
    mb: 2,
  },
  avatar: {
    mx: "auto",
    mb: 2,
    width: 96,
    height: 96,
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
};

function RegistrationSuccess({ competitor, onRegisterAnother }) {
  return (
    <Container maxWidth="md" sx={styles.container}>
      <Card>
        <CardContent sx={styles.cardContent}>
          <CheckCircleIcon sx={styles.successIcon} />
          <Avatar
            src={competitor.imageUrl}
            alt={competitor.name}
            sx={styles.avatar}
            variant="rounded"
          />
          <Typography variant="h5" component="h1" gutterBottom>
            Registration complete
          </Typography>
          <Typography variant="h6">{competitor.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            Cubuzzle ID: {competitor.id}
          </Typography>

          <Stack direction="row" sx={styles.chipWrap}>
            <Chip
              label={`Division ${competitor.registeredDivision}`}
              variant="outlined"
            />
            {competitor.events.map((eventId) => (
              <Chip
                key={eventId}
                icon={<CubingIcon eventId={eventId} small />}
                label={getEventDisplayName(eventId)}
                variant="outlined"
              />
            ))}
          </Stack>

          <Stack direction="row" sx={styles.actions}>
            <Button onClick={onRegisterAnother} startIcon={<RestartAltIcon />}>
              Register another
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default RegistrationSuccess;
