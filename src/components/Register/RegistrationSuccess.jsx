import { Link as RouterLink } from "react-router-dom";
import { Avatar, Button, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PeopleIcon from "@mui/icons-material/People";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import CubingIcon from "../CubingIcon/CubingIcon";
import { getEventDisplayName } from "../../lib/competition";
import { styles } from "./styles";

const succesStyles = styles.successContainer;

function RegistrationSuccess({ competitor, onRegisterAnother }) {
  return (
    <Container maxWidth="md" sx={succesStyles.container}>
      <Card>
        <CardContent sx={succesStyles.cardContent}>
          <CheckCircleIcon sx={succesStyles.successIcon} />
          <Avatar
            src={competitor.imageUrl}
            alt={competitor.name}
            sx={succesStyles.avatar}
            variant="rounded"
          />
          <Typography variant="h5" component="h1" gutterBottom>
            Registration complete
          </Typography>
          <Typography variant="h6">{competitor.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            Cubuzzle ID: {competitor.id}
          </Typography>

          <Stack direction="row" sx={succesStyles.chipWrap}>
            {competitor.registeredDivision && (
              <Chip label={`Division ${competitor.registeredDivision}`} variant="outlined" />
            )}
            {competitor.events.map((eventId) => (
              <Chip key={eventId} icon={<CubingIcon eventId={eventId} small />} label={getEventDisplayName(eventId)} variant="outlined" />
            ))}
          </Stack>

          <Stack direction="row" sx={succesStyles.actions}>
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
