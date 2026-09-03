import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { alpha } from "@mui/material/styles";
import { styles as sharedStyles } from "./styles";

const choiceCardSx = {
  appearance: "none",
  WebkitAppearance: "none",
  position: "relative",
  display: "flex",
  alignItems: "center",
  width: "100%",
  m: 0,
  px: 1.75,
  py: 1.5,
  pr: 4.25,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2.5,
  bgcolor: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
  userSelect: "none",
  transition:
    "border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
  "&:hover": {
    borderColor: "primary.main",
    bgcolor: "action.hover",
    transform: "translateY(-1px)",
  },
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: 2,
  },
};

const choiceCardSelectedSx = {
  borderColor: "primary.main",
  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
  boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`,
};

function toGridColumns(columns) {
  if (columns == null) {
    return undefined;
  }

  const toCss = (value) =>
    typeof value === "number" ? `repeat(${value}, minmax(0, 1fr))` : value;

  if (typeof columns === "object") {
    return Object.fromEntries(
      Object.entries(columns).map(([breakpoint, value]) => [
        breakpoint,
        toCss(value),
      ]),
    );
  }

  return toCss(columns);
}

function ChoiceCard({ selected, onClick, children, sx, role, ...props }) {
  return (
    <Box
      component="button"
      type="button"
      role={role}
      aria-pressed={role === "radio" ? undefined : selected}
      onClick={onClick}
      sx={{
        ...choiceCardSx,
        ...(selected && choiceCardSelectedSx),
        ...sx,
      }}
      {...props}
    >
      {children}
      {selected && (
        <CheckCircleIcon
          color="primary"
          fontSize="small"
          sx={{ position: "absolute", top: 10, right: 10 }}
        />
      )}
    </Box>
  );
}

function DefaultOption({ option, selected }) {
  const Icon = option.icon;

  return (
    <>
      {Icon && (
        <Box sx={sharedStyles.iconTile(selected)}>
          <Icon fontSize="small" color="inherit" />
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant={option.hint ? "subtitle2" : "body2"}
          fontWeight={700}
          lineHeight={1.25}
        >
          {option.label}
        </Typography>
        {option.hint && (
          <Typography variant="caption" color="text.secondary">
            {option.hint}
          </Typography>
        )}
      </Box>
    </>
  );
}

function ChoiceGroup({
  name,
  label,
  hint,
  options,
  columns,
  value,
  onChange,
  error,
  multiple = false,
  required = true,
  renderOption,
  cardSx,
}) {
  const selectedValues = multiple ? (value ?? []) : [value];

  const handleSelect = (optionValue) => {
    if (!multiple) {
      onChange(optionValue);
      return;
    }

    const current = Array.isArray(value) ? value : [];
    const next = current.includes(optionValue)
      ? current.filter((item) => item !== optionValue)
      : [...current, optionValue];

    onChange(
      options
        .filter((option) => next.includes(option.value))
        .map((option) => option.value),
    );
  };

  return (
    <FormControl
      required={required}
      error={Boolean(error)}
      fullWidth
      data-field={name}
    >
      <FormLabel sx={sharedStyles.fieldLabel}>{label}</FormLabel>
      {hint && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={sharedStyles.fieldHint}
        >
          {hint}
        </Typography>
      )}
      <Box
        role={multiple ? "group" : "radiogroup"}
        aria-label={label}
        sx={{
          display: "grid",
          gridTemplateColumns: toGridColumns(columns),
          gap: 1.25,
        }}
      >
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <ChoiceCard
              key={String(option.value)}
              role={multiple ? undefined : "radio"}
              aria-checked={multiple ? undefined : selected}
              selected={selected}
              onClick={() => handleSelect(option.value)}
              sx={cardSx}
            >
              {renderOption ? (
                renderOption(option, { selected })
              ) : (
                <DefaultOption option={option} selected={selected} />
              )}
            </ChoiceCard>
          );
        })}
      </Box>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default ChoiceGroup;
