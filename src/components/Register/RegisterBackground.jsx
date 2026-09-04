import { useEffect } from "react";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { blue, pink } from "@mui/material/colors";
import cubeBg from "../../assets/cube-bg.png";
import cubeBgLower from "../../assets/cube-background.png";
import { styles } from "./styles";

const overlayPaper = {
  backgroundColor: "#0c1018",
  backgroundImage: "none",
  backdropFilter: "none",
};

const registerTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: blue[200],
    },
    secondary: {
      main: pink["A400"],
    },
    background: {
      default: "#05070c",
      paper: "#0c1018",
    },
  },
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        paper: overlayPaper,
        listbox: overlayPaper,
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: overlayPaper,
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: overlayPaper,
      },
    },
    MuiPickersPopper: {
      styleOverrides: {
        paper: overlayPaper,
      },
    },
  },
});

function RegisterBackground({ children }) {
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#05070c";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <ThemeProvider theme={registerTheme}>
      <Box sx={styles.pageShell}>
        <Box sx={styles.pageBackdrop} aria-hidden>
          <Box
            component="img"
            src={cubeBg}
            alt=""
            sx={styles.pageBackdropImage}
          />
          <Box
            component="img"
            src={cubeBgLower}
            alt=""
            sx={styles.pageBackdropImageLower}
          />
          <Box sx={styles.pageCubePattern} />
          <Box sx={styles.pageVignette} />
        </Box>
        <Box sx={styles.pageInner}>{children}</Box>
      </Box>
    </ThemeProvider>
  );
}

export default RegisterBackground;
