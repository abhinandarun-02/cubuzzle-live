import { Fragment, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Chip,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import scrollIntoView from "scroll-into-view-if-needed";

import CubingIcon from "../CubingIcon/CubingIcon";

function CompetitionEventList({ competitionEvents }) {
  const [selectedId, setSelectedId] = useState(null);

  function handleCompetitionEventClick(event, competitionEvent) {
    setSelectedId(selectedId === competitionEvent.id ? null : competitionEvent.id);
    // Prevent swipeable drawer from closing when event gets selected.
    event.stopPropagation();
  }

  return (
    <List
      dense={true}
      sx={{
        py: 0.5,
        px: 1,
      }}
    >
      {competitionEvents.map((competitionEvent) => {
        const isSelected = selectedId === competitionEvent.id;
        const hasActiveRound = competitionEvent.rounds?.some(
          (round) => round.active && !round.finished
        );

        return (
          <Fragment key={competitionEvent.id}>
            <ListItemButton
              onClick={(event) => handleCompetitionEventClick(event, competitionEvent)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1,
                px: 1.5,
                transition: "all 0.2s ease-in-out",
                bgcolor: (theme) =>
                  isSelected
                    ? alpha(theme.palette.text.primary, 0.1)
                    : "transparent",
                "&:hover": {
                  bgcolor: (theme) =>
                    isSelected
                      ? alpha(theme.palette.text.primary, 0.14)
                      : alpha(theme.palette.action.hover, 0.08),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "inherit",
                }}
              >
                <CubingIcon eventId={competitionEvent.id} />
              </ListItemIcon>
              <ListItemText
                primary={competitionEvent.name}
                primaryTypographyProps={{
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: "0.9rem",
                  color: "text.primary",
                }}
              />
              {hasActiveRound && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                    mr: 1,
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1, transform: "scale(1)" },
                      "50%": { opacity: 0.6, transform: "scale(1.1)" },
                      "100%": { opacity: 1, transform: "scale(1)" },
                    },
                  }}
                />
              )}
              <ExpandMoreIcon
                sx={{
                  fontSize: "1.2rem",
                  color: "text.secondary",
                  transition: "transform 0.3s ease",
                  transform: isSelected ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </ListItemButton>
            <Collapse
              in={isSelected}
              timeout="auto"
              unmountOnExit
              onEntered={(element) => {
                scrollIntoView(element, {
                  behavior: "smooth",
                  scrollMode: "if-needed",
                  block: "end",
                });
              }}
            >
              <List
                dense={true}
                sx={{
                  pl: 2,
                  pr: 0.5,
                  py: 0.5,
                  mb: 0.5,
                  ml: 2.5,
                  borderLeft: (theme) =>
                    `2px solid ${alpha(theme.palette.text.secondary, 0.3)}`,
                }}
              >
                {competitionEvent.rounds.map((round) => {
                  const isActive = round.active && !round.finished;
                  const isFinished = round.finished;
                  const isDisabled = !isFinished && !isActive;

                  return (
                    <ListItemButton
                      key={round.id}
                      component={RouterLink}
                      to={`/events/${competitionEvent.id}/rounds/${round.id}`}
                      disabled={isDisabled}
                      sx={{
                        borderRadius: 1.5,
                        py: 0.75,
                        px: 1.5,
                        mb: 0.25,
                        minHeight: 36,
                        transition: "all 0.2s ease-in-out",
                        "&:hover:not(.Mui-disabled)": {
                          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.08),
                          transform: "translateX(2px)",
                        },
                        "&.Mui-disabled": {
                          opacity: 0.5,
                        },
                      }}
                    >
                      <ListItemText
                        primary={round.name}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      />
                      {isActive && (
                        <Chip
                          label="Live"
                          size="small"
                          color="success"
                          sx={{
                            borderRadius: "8px",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            height: 22,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            "& .MuiChip-label": {
                              px: 1,
                            },
                          }}
                        />
                      )}

                      {isFinished && (
                        <Chip
                          label="Done"
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: "8px",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            height: 22,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            borderColor: (theme) => alpha(theme.palette.text.secondary, 0.3),
                            color: "text.secondary",
                            "& .MuiChip-label": {
                              px: 1,
                            },
                          }}
                        />
                      )}
                    </ListItemButton>
                  );
                })}
              </List>
            </Collapse>
          </Fragment>
        );
      })}
    </List>
  );
}

export default CompetitionEventList;
