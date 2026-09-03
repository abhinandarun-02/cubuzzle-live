import { useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { styles as sharedStyles } from "./styles";

function PhotoUpload({
  preview,
  hasFile,
  error,
  uploading,
  onChange,
  onRemove,
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (file) {
      onChange(file);
    }
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    handleFile(file);
  };

  const handleRemove = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onRemove();
  };

  return (
    <FormControl
      required
      error={Boolean(error)}
      data-field="photo"
      sx={{ display: "block", mb: 3.5 }}
    >
      <FormLabel sx={sharedStyles.fieldLabel}>Photo</FormLabel>
      <Box
        component="label"
        onDragEnter={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start" },
          gap: { xs: 1.5, sm: 2.5 },
          px: { xs: 2, sm: 2.5 },
          py: 2.25,
          borderRadius: 3,
          border: "1.5px dashed",
          borderColor: error
            ? "error.main"
            : dragOver
              ? "primary.main"
              : "divider",
          bgcolor: (theme) =>
            dragOver
              ? alpha(theme.palette.primary.main, 0.08)
              : theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.03)"
                : alpha(theme.palette.primary.main, 0.03),
          cursor: "pointer",
          transition:
            "border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease",
          "&:hover": {
            borderColor: error ? "error.main" : "primary.main",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
          },
        }}
      >
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Avatar
            src={preview}
            sx={{
              width: 104,
              height: 104,
              borderWidth: 3,
              borderStyle: preview ? "solid" : "dashed",
              borderColor: error ? "error.main" : "divider",
              bgcolor: "action.hover",
            }}
          >
            <PhotoCameraIcon sx={{ fontSize: 36, color: "text.disabled" }} />
          </Avatar>
          {(hasFile || preview) && (
            <Tooltip title="Remove photo">
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  "&:hover": {
                    bgcolor: "error.main",
                    color: "#fff",
                  },
                }}
                onClick={handleRemove}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {uploading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.55)",
              }}
            >
              <CircularProgress size={26} sx={{ color: "#fff" }} />
            </Box>
          )}
        </Box>
        <Box sx={{ textAlign: { xs: "center", sm: "left" }, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {uploading
              ? "Uploading photo…"
              : hasFile
                ? "Looking good — click to change"
                : dragOver
                  ? "Drop your photo here"
                  : "Upload a competition photo"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            JPEG, PNG or WebP, up to 5&nbsp;MB. Drag and drop or click to
            browse.
          </Typography>
          {!hasFile && (
            <Typography
              variant="caption"
              color="primary"
              sx={{
                mt: 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                fontWeight: 700,
              }}
            >
              <CloudUploadOutlinedIcon fontSize="small" />
              Choose file
            </Typography>
          )}
        </Box>
        <input
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
        />
      </Box>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default PhotoUpload;
