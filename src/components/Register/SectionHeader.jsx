import { Box, Typography } from "@mui/material";
import { styles } from "./styles";

function SectionHeader({ icon: Icon, title }) {
  return (
    <Box sx={styles.sectionHeader}>
      <Box sx={styles.sectionIcon}>
        <Icon fontSize="small" />
      </Box>
      <Typography variant="h6" sx={styles.sectionTitle}>
        {title}
      </Typography>
    </Box>
  );
}

export default SectionHeader;
