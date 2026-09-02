import { Autocomplete, Box, InputAdornment, TextField } from "@mui/material";
import { COUNTRIES } from "../../lib/countries";
import FlagIcon from "../FlagIcon/FlagIcon";

function CountrySelect({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  name,
}) {
  return (
    <Box data-field={name}>
      <Autocomplete
        options={COUNTRIES}
        getOptionLabel={(option) => option.name}
        value={value}
        onChange={(event, newValue) => onChange(newValue)}
        onBlur={onBlur}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ display: "flex", gap: 1 }}>
            <FlagIcon code={option.code.toLowerCase()} />
            {option.name}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            required
            name={name}
            label={label}
            error={Boolean(error)}
            helperText={helperText}
            inputProps={{
              ...params.inputProps,
              "data-field": name,
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: value && (
                <InputAdornment position="start">
                  <FlagIcon code={value.code.toLowerCase()} />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </Box>
  );
}

export default CountrySelect;
