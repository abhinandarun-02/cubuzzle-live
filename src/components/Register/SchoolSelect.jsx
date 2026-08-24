import { Autocomplete, InputAdornment, TextField } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { SCHOOLS } from "../../lib/schools";

const filter = createFilterOptions();

function getSchoolLabel(option) {
  if (typeof option === "string") {
    return option;
  }
  if (option?.inputValue) {
    return option.inputValue;
  }
  return option?.label ?? "";
}

function toSchoolValue(newValue) {
  if (!newValue) return "";
  if (typeof newValue === "string") return newValue;
  if (newValue.inputValue) return newValue.inputValue;
  return newValue.label ?? "";
}

function SchoolSelect({ label, value, onChange, onBlur, error, helperText }) {
  const selected =
    SCHOOLS.find((school) => school.label === value) ?? (value || null);

  return (
    <Autocomplete
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      fullWidth
      options={SCHOOLS}
      groupBy={(option) => option.emirate}
      value={selected}
      onChange={(event, newValue) => onChange(toSchoolValue(newValue))}
      onBlur={onBlur}
      getOptionLabel={getSchoolLabel}
      isOptionEqualToValue={(option, val) =>
        getSchoolLabel(option) === getSchoolLabel(val)
      }
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const { inputValue } = params;
        const isExisting = options.some(
          (option) =>
            option.label.toLowerCase() === inputValue.trim().toLowerCase(),
        );
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue,
            label: `Add "${inputValue}"`,
          });
        }
        return filtered;
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {option.label}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          required
          label={label}
          error={Boolean(error)}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SchoolOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default SchoolSelect;
