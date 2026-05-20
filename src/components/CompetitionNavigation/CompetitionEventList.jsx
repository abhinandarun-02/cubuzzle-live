import { Fragment, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Chip, Collapse, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
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
    <List dense={true}>
      {competitionEvents.map((competitionEvent) => (
        <Fragment key={competitionEvent.id}>
          <ListItemButton
            onClick={(event) => handleCompetitionEventClick(event, competitionEvent)}
          >
            <ListItemIcon>
              <CubingIcon eventId={competitionEvent.id} />
            </ListItemIcon>
            <ListItemText primary={competitionEvent.name} />
          </ListItemButton>
          <Collapse
            in={selectedId === competitionEvent.id}
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
            <List dense={true}>
              <ListItemButton
                component={RouterLink}
                to={`/events/${competitionEvent.id}/leaderboard`}
              >
                <ListItemText primary="Qualifier Leaderboard" />
              </ListItemButton>
              {competitionEvent.rounds.map((round) => (
                <ListItemButton
                  key={round.id}
                  component={RouterLink}
                  to={`/events/${competitionEvent.id}/rounds/${round.id}`}
                  disabled={!round.finished && !round.active}
                >
                  <ListItemText primary={round.name} />
                  {round.active && !round.finished && (
                    <Chip
                      label="Live"
                      size="small"
                      sx={{
                        borderRadius: "6px",
                        fontSize: "0.7em",
                        fontWeight: 500,
                      }}
                    />
                  )}

                  {round.finished && (
                    <Chip
                      label="Done"
                      size="small"
                      sx={{
                        borderRadius: "6px",
                        fontSize: "0.7em",
                        fontWeight: 500,
                      }}
                    />
                  )}
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Fragment>
      ))}
    </List>
  );
}

export default CompetitionEventList;
