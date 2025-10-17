import { Box, Typography, Link } from "@mui/material";
import logo from "../DefaultNavigation/logo.png";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 1.5,
        textAlign: "center",
        mt: "auto",
      }}
    >
      <Box
        sx={{
          fontSize: "0.7rem",
          opacity: 0.8,
          fontWeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Link 
          href="https://cubuzzle.com" 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ 
            color: 'text.secondary',
            textDecoration: 'underline',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: "0.7rem",
            cursor: 'pointer',
            opacity: 0.8,
            '&:hover': {
              opacity: 1,
              textDecoration: 'underline'
            }
          }}
        >
          <img 
            src={logo} 
            alt="cubuzzle logo" 
            style={{ 
              height: '16px', 
              width: 'auto',
              opacity: 0.8 
            }} 
          />
          cubuzzle.com
        </Link>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: "0.7rem",
            opacity: 0.6,
          }}
        >
          • Powered by Hariology
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;