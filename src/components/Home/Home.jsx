// import { gql, useQuery } from "@apollo/client";
import { Box, Grid, Paper } from "@mui/material";
import HomeCompetitions from "./HomeCompetitions";
import { competitionData } from "./data";



function Home() {
  // Static placeholder data
  const competitions = competitionData;



  return (
    <Box
      sx={{
        py: { xs: 2, md: 3 },
        px: { xs: 1, md: 3 },
        display: "flex",
        minHeight: "100%",
      }}
    >
      <Grid container spacing={2} direction="column" sx={{ flexGrow: 1 }}>
        <Grid item>
          <Paper>
            <HomeCompetitions competitions={competitions} />
          </Paper>
        </Grid>

        <Grid item sx={{ flexGrow: 1 }} />
      </Grid>
    </Box>
  );
}

export default Home;
