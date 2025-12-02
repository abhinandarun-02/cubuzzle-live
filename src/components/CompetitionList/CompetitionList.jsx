import { Link } from "react-router-dom";
import {
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import VirtualList from "../VirtualList/VirtualList";
import { formatDateRange } from "../../lib/date";

function CompetitionList({ title, competitions }) {
  return (
    <List dense={true} disablePadding>
      {title && <ListSubheader disableSticky>{title}</ListSubheader>}
      <VirtualList
        maxHeight={300}
        itemHeight={60}
        items={competitions}
        renderItem={(competition, { style }) => {
          return (
            <ListItemButton
              key={competition.id}
              style={style}
              component={Link}
              to="/"
            >
          
              <ListItemText
                primary={competition.name}
                secondary={formatDateRange(
                  competition.startDate,
                  competition.endDate,
                )}
              />
            </ListItemButton>
          );
        }}
      />
    </List>
  );
}

export default CompetitionList;
