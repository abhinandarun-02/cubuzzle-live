import { useState, useCallback, useEffect, useMemo } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { grey, cyan } from "@mui/material/colors";

import { ToggleThemeContext } from "./useToggleTheme";

const themes = {
  light: createTheme({
    palette: {
      primary: {
        main: grey[800],
      },
      secondary: {
        main: cyan[500],
      },
      background: {
        default: "#fafafa",
        paper: "#ffffff",
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: grey[300],
      },
      secondary: {
        main: cyan[300],
      },
      background: {
        default: "#121212",
        paper: "#121212",
      },
    },
  }),
};

const themeColor = {
  light: grey["800"],
  dark: "#121212",
};

function getStoredThemeType() {
  return localStorage.getItem("themeType");
}

function setStoredThemeType(themeType) {
  localStorage.setItem("themeType", themeType);
}

export function ThemeProvider({ children }) {
  const storedThemeType = useMemo(getStoredThemeType, []);
  const [themeType, setThemeType] = useState(
    storedThemeType || "dark",
  );

  const toggleTheme = useCallback(() => {
    setThemeType((themeType) => (themeType === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    setStoredThemeType(themeType);

    const themeMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeMetaTag) {
      themeMetaTag.setAttribute("content", themeColor[themeType]);
    }
  }, [themeType]);

  return (
    <MuiThemeProvider theme={themes[themeType]}>
      <ToggleThemeContext.Provider value={toggleTheme}>
        {children}
      </ToggleThemeContext.Provider>
    </MuiThemeProvider>
  );
}

export default ThemeProvider;
