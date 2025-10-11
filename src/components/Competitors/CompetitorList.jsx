import { useState } from "react";
import { Grid, IconButton, InputBase, List, ListItemText, ListItemIcon, Paper, ListItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FlagIcon from "../FlagIcon/FlagIcon";

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
            <ListItem key={competitor.id}>
              <ListItemIcon>
                <FlagIcon code={competitor.country.iso2.toLowerCase()} size="lg" />
              </ListItemIcon>
              <ListItemText primary={competitor.name} />
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
}

export default CompetitorList;
