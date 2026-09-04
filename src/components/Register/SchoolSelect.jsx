import { Autocomplete, Box, InputAdornment, TextField } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { SCHOOLS } from "../../lib/schools";

const filter = createFilterOptions();

const NOT_APPLICABLE_SCHOOL = {
  value: "not-applicable",
  label: "Not Applicable",
};

const SORTED_SCHOOLS = [
  NOT_APPLICABLE_SCHOOL,
  ...[...SCHOOLS].sort(
    (a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }) ||
      a.emirate.localeCompare(b.emirate, undefined, { sensitivity: "base" }),
  ),
];

function formatSchoolOption(school) {
  if (!school?.label) return "";
  return school.emirate ? `${school.label}, ${school.emirate}` : school.label;
}

function getSchoolLabel(option) {
  if (typeof option === "string") {
    return option;
  }
  if (option?.inputValue) {
    return option.inputValue;
  }
  return formatSchoolOption(option);
}

function toSchoolValue(newValue) {
  if (!newValue) return "";
  if (typeof newValue === "string") return newValue;
  if (newValue.inputValue) return newValue.inputValue;
  return newValue.label ?? "";
}

function SchoolSelect({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  name,
}) {
  const selected =
    SORTED_SCHOOLS.find((school) => school.label === value) ?? (value || null);

  return (
    <Box data-field={name}>
      <Autocomplete
        freeSolo
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        fullWidth
        options={SORTED_SCHOOLS}
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
              {option.inputValue ? option.label : getSchoolLabel(option)}
            </li>
          );
        }}
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
    </Box>
  );
}

export default SchoolSelect;
