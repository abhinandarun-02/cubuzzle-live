import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import { DIVISIONS, MODES, REGISTRATION_EVENTS } from "../../lib/registration";
import CubingIcon from "../CubingIcon/CubingIcon";
import ChoiceGroup from "./ChoiceGroup";
import FormSection from "./FormSection";
import { styles } from "./styles";

const EVENT_OPTIONS = REGISTRATION_EVENTS.map((event) => ({
  value: event.id,
  label: event.label,
}));

const MODE_OPTIONS = MODES.map((mode) => ({
  ...mode,
  hint: mode.value === "onsite" ? "Compete in person" : "Compete remotely",
  icon: mode.value === "onsite" ? PlaceOutlinedIcon : LanguageIcon,
}));

const DEFAULT_DIVISION_HINT =
  "Choose the division closest to your typical 3x3 average";

function CompetitionDetails({
  form,
  showDivision = true,
  divisionHint,
  step = 3,
}) {
  const { fieldProps } = form;

  return (
    <FormSection
      id="section-competition"
      step={step}
      title="Competition details"
      description="Pick your division, how you'll compete, and every event you want to enter."
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
        {showDivision && (
          <ChoiceGroup
            label="Division"
            hint={divisionHint || DEFAULT_DIVISION_HINT}
            options={DIVISIONS}
            columns={{ xs: 2, sm: 3, md: 5 }}
            cardSx={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              minHeight: 112,
              px: 1.25,
              py: 1.75,
              textAlign: "center",
            }}
            renderOption={(option, { selected }) => (
              <>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: option.value === "A+" ? 16 : 18,
                    bgcolor: selected
                      ? "primary.main"
                      : (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: selected ? "primary.contrastText" : "primary.main",
                  }}
                >
                  {option.label}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textAlign: "center", lineHeight: 1.3 }}
                >
                  {option.hint}
                </Typography>
              </>
            )}
            {...fieldProps("registeredDivision")}
          />
        )}

        <ChoiceGroup
          label="Mode of Participation"
          options={MODE_OPTIONS}
          columns={{ xs: 1, sm: 2 }}
          cardSx={{ gap: 1.25, minHeight: 80, alignItems: "flex-start" }}
          {...fieldProps("modeOfParticipation")}
        />

        <ChoiceGroup
          label="Events"
          hint="Select every event you want to compete in"
          options={EVENT_OPTIONS}
          columns={{ xs: 2, sm: 3, md: 5 }}
          multiple
          cardSx={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            minHeight: 96,
            px: 1,
            textAlign: "center",
          }}
          renderOption={(option, { selected }) => (
            <>
              <Box sx={styles.iconTile(selected)}>
                <CubingIcon eventId={option.value} />
              </Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ textAlign: "center", lineHeight: 1.25 }}
              >
                {option.label}
              </Typography>
            </>
          )}
          {...fieldProps("events")}
        />
      </Box>
    </FormSection>
  );
}

export default CompetitionDetails;
