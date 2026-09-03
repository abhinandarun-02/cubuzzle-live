import { InputAdornment, TextField } from "@mui/material";

function TextInput({
  label,
  type,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  endAdornment,
  InputProps,
  name,
  ...props
}) {
  return (
    <TextField
      fullWidth
      required
      name={name}
      type={type}
      label={label}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      error={Boolean(error)}
      helperText={helperText}
      data-field={name}
      InputProps={{
        startAdornment: Icon && (
          <InputAdornment position="start">
            <Icon fontSize="small" color="action" />
          </InputAdornment>
        ),
        endAdornment,
        ...InputProps,
      }}
      {...props}
    />
  );
}

export default TextInput;
