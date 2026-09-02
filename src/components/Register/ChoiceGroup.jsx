import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styles as sharedStyles } from "./styles";

const choiceCardSx = {
  appearance: "none",
  WebkitAppearance: "none",
  display: "flex",
  alignItems: "center",
  width: "100%",
  m: 0,
  px: 1.75,
  py: 1.5,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  bgcolor: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
  userSelect: "none",
  transition: "border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
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
  bgcolor: "action.selected",
  boxShadow: (theme) =>
    `0 0 0 1px ${theme.palette.primary.main}, 0 6px 16px ${alpha(theme.palette.primary.main, 0.28)}`,
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
    </Box>
  );
}

function DefaultOption({ option, selected }) {
  const Icon = option.icon;

  return (
    <>
      {Icon && (
        <Icon fontSize="small" color={selected ? "primary" : "action"} />
      )}
      <Typography
        variant={option.hint ? "subtitle1" : "body2"}
        fontWeight={option.hint ? 700 : 600}
        lineHeight={option.hint ? 1.2 : undefined}
      >
        {option.label}
      </Typography>
      {option.hint && (
        <Typography variant="caption" color="text.secondary">
          {option.hint}
        </Typography>
      )}
    </>
  );
}

function ChoiceGroup({
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
    <FormControl required={required} error={Boolean(error)} fullWidth>
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
              {multiple && selected && (
                <CheckCircleIcon color="primary" fontSize="small" />
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
