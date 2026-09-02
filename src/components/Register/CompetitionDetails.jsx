import { Card, CardContent, Stack, Typography } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import { DIVISIONS, MODES, REGISTRATION_EVENTS } from "../../lib/registration";
import CubingIcon from "../CubingIcon/CubingIcon";
import ChoiceGroup from "./ChoiceGroup";
import SectionHeader from "./SectionHeader";
import { styles } from "./styles";

const EVENT_OPTIONS = REGISTRATION_EVENTS.map((event) => ({
  value: event.id,
  label: event.label,
}));

const MODE_OPTIONS = MODES.map((mode) => ({
  ...mode,
  icon: mode.value === "onsite" ? PlaceOutlinedIcon : LanguageIcon,
}));

const DEFAULT_DIVISION_HINT = "Choose the division closest to your typical 3x3 average";

function CompetitionDetails({ form, showDivision = true, divisionHint }) {
  const { fieldProps } = form;

  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <SectionHeader icon={EmojiEventsOutlinedIcon} title="Competition Details" />

        <Stack spacing={3.5}>
          {showDivision && (
            <ChoiceGroup
              label="Division"
              hint={divisionHint || DEFAULT_DIVISION_HINT}
              options={DIVISIONS}
              columns={{ xs: 2, sm: 3, md: 5 }}
              cardSx={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0.5,
                minHeight: 76,
              }}
              {...fieldProps("registeredDivision")}
            />
          )}

          <ChoiceGroup
            label="Mode of Participation"
            options={MODE_OPTIONS}
            columns={{ xs: 1, sm: "repeat(2, minmax(0, 220px))" }}
            cardSx={{ gap: 1.25, minHeight: 56 }}
            {...fieldProps("modeOfParticipation")}
          />

          <ChoiceGroup
            label="Events"
            hint="Select every event you want to compete in"
            options={EVENT_OPTIONS}
            columns={{ xs: 2, sm: 4 }}
            multiple
            cardSx={{ gap: 1.25, minHeight: 56 }}
            renderOption={(option) => (
              <>
                <CubingIcon eventId={option.value} />
                <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                  {option.label}
                </Typography>
              </>
            )}
            {...fieldProps("events")}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default CompetitionDetails;
