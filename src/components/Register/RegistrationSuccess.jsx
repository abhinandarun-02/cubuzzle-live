import { Avatar, Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import CubingIcon from "../CubingIcon/CubingIcon";
import { getEventDisplayName } from "../../lib/competition";
import { fadeInStyle, styles } from "./styles";

const succesStyles = styles.successContainer;

function RegistrationSuccess({ competitor, onRegisterAnother }) {
  return (
    <Container maxWidth="md" sx={succesStyles.container}>
      <Card sx={{ ...styles.card, ...fadeInStyle(0) }}>
        <CardContent sx={succesStyles.cardContent}>
          <Box sx={succesStyles.successIconWrap}>
            <CheckCircleIcon sx={succesStyles.successIcon} />
          </Box>
          <Avatar
            src={competitor.imageUrl}
            alt={competitor.name}
            sx={succesStyles.avatar}
            variant="rounded"
          />
          <Typography variant="h5" component="h1" fontWeight={700} gutterBottom>
            Registration complete!
          </Typography>
          <Typography variant="h6">{competitor.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            Cubuzzle ID: {competitor.id}
          </Typography>

          <Stack direction="row" sx={succesStyles.chipWrap}>
            {competitor.registeredDivision && (
              <Chip
                color="primary"
                label={`Division ${competitor.registeredDivision}`}
                variant="outlined"
              />
            )}
            {competitor.events.map((eventId) => (
              <Chip
                key={eventId}
                icon={<CubingIcon eventId={eventId} small />}
                label={getEventDisplayName(eventId)}
                variant="outlined"
              />
            ))}
          </Stack>

          <Stack direction="row" sx={succesStyles.actions}>
            <Button
              variant="contained"
              onClick={onRegisterAnother}
              startIcon={<RestartAltIcon />}
              sx={{ borderRadius: 3, fontWeight: 600 }}
            >
              Register another
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default RegistrationSuccess;
