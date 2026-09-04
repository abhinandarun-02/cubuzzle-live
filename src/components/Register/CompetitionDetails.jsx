import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DIVISIONS, REGISTRATION_EVENTS } from "../../lib/registration";
import CubingIcon from "../CubingIcon/CubingIcon";
import ChoiceGroup from "./ChoiceGroup";
import FormSection from "./FormSection";
import { styles } from "./styles";

const EVENT_OPTIONS = REGISTRATION_EVENTS.map((event) => ({
  value: event.id,
  label: event.label,
}));

function CompetitionDetails({
  form,
  showDivision = true,
  divisionLocked = false,
  divisionHint,
  step = 3,
}) {
  const { fieldProps } = form;

  return (
    <FormSection
      id="section-competition"
      step={step}
      title="Competition Details"
      description="Pick your division and every event you want to enter."
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
        {showDivision && (
          <ChoiceGroup
            label="Select your Division based on your Average Time"
            hint={divisionHint}
            options={DIVISIONS}
            columns={{ xs: 1 }}
            disabled={divisionLocked}
            cardSx={{
              gap: 1.5,
              minHeight: 76,
              alignItems: "center",
              px: 1.75,
              py: 1.5,
            }}
            renderOption={(option, { selected }) => (
              <>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: option.value === "A+" ? 15 : 16,
                    bgcolor: selected
                      ? "primary.main"
                      : (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: selected ? "primary.contrastText" : "primary.main",
                  }}
                >
                  {option.value}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1, pr: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} lineHeight={1.25}>
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.hint}
                  </Typography>
                </Box>
              </>
            )}
            {...fieldProps("registeredDivision")}
          />
        )}

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
