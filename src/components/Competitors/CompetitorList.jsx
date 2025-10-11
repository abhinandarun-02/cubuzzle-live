import { useState } from "react";
import {
  Grid,
  IconButton,
  InputBase,
  List,
  ListItemText,
  ListItemIcon,
  Paper,
  Avatar,
  ListItemButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function searchCompetitors(competitors, search) {
  const searchParts = search.toLowerCase().split(/\s+/);
  return competitors.filter((competitor) => searchParts.every((part) => competitor.name.toLowerCase().includes(part)));
}

function CompetitorList({ competitors }) {
  const [search, setSearch] = useState("");

  const filteredCompetitors = searchCompetitors(competitors, search).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Grid container direction="column" alignItems="center" spacing={1}>
      <Grid item>
        <Paper
          sx={{
            p: "2px 2px 2px 16px",
            display: "inline-block",
          }}
        >
          <InputBase
            autoFocus
            value={search}
            placeholder="Search competitor"
            onChange={(event) => setSearch(event.target.value)}
          />
          <IconButton disabled size="large">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Grid>
      <Grid item sx={{ width: "100%" }}>
        <List>
          {filteredCompetitors.map((competitor) => (
            <ListItemButton key={competitor.id}>
              {/* render profile picture */}
              <ListItemIcon>
                <Avatar src={competitor.imageUrl} alt={competitor.name} sx={{ width: 32, height: 32 }} />
              </ListItemIcon>
              <ListItemText primary={competitor.name} />
            </ListItemButton>
          ))}
        </List>
      </Grid>
    </Grid>
  );
}

export default CompetitorList;
