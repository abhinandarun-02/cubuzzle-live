import { Box, Avatar, Typography, Paper, Chip } from "@mui/material";
import FlagIcon from "../FlagIcon/FlagIcon";
import { withImageWidth } from "../../lib/utils";

function CompetitorInfo({ competitor }) {
  return (
    <Paper>
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Avatar
          src={withImageWidth(competitor.imageUrl, 512)}
          alt={competitor.name}
          sx={{
            width: { xs: 120, sm: 140, md: 160 },
            height: { xs: 120, sm: 140, md: 160 },
            fontSize: { xs: "3rem", md: "3.5rem" },
            mb: 2,
          }}
          variant="rounded"
        />

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
            mb: 1,
          }}
        >
          {competitor.name}
        </Typography>

        {competitor.country?.code && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            mb={2}
          >
            <FlagIcon
              code={competitor.country.code.toLowerCase()}
              sx={{ fontSize: { xs: 24, md: 28 } }}
            />
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                color: "text.secondary",
              }}
            >
              {competitor.country.name}
            </Typography>
          </Box>
        )}

        <Chip
          label={`ID: ${competitor.id}`}
          variant="outlined"
          size="small"
          sx={{
            fontSize: { xs: "0.8rem", md: "0.875rem" },
            fontWeight: 500,
          }}
        />
      </Box>
    </Paper>
  );
}

export default CompetitorInfo;
